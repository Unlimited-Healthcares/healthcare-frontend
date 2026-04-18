import React, { useState, useEffect } from 'react';
import { X, Users, User, Stethoscope, AlertTriangle, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateChatRoomDto, ChatRoomType, ChatParticipantSuggestion } from '@/types/chat';
import UserSelector from './UserSelector';
import { useAuth } from '@/hooks/useAuth';
import { participantSuggestionsService } from '@/services/participantSuggestionsService';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  centerId?: string;
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: any) => void;
  onOpenExistingRoom?: (roomId: string) => void;
  loading?: boolean;
  centerId?: string;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onOpenExistingRoom,
  loading = false,
  centerId
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateChatRoomDto>({
    name: '',
    type: ChatRoomType.DIRECT,
    maxParticipants: 2,
    isEncrypted: true,
    autoDeleteAfterDays: 1825, // 5 years default
    roomSettings: {
      allowFileSharing: true,
      allowVideoCalls: true,
      requireApproval: false
    },
    participantIds: []
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<ChatParticipantSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [checkingExistingDM, setCheckingExistingDM] = useState(false);

  // Fetch participant suggestions when modal opens
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isOpen || !user?.roles || !user?.id) {
        return;
      }

      setLoadingSuggestions(true);
      setSuggestedUsers([]);

      try {
        const roles = user.roles;
        const userId = user.id;
        const profileId = (profile as any)?.id;
        const centerIdFromProfile = (profile as any)?.centerId;
        const finalCenterId = centerId || centerIdFromProfile;

        console.log('🔍 Fetching suggestions for:', { roles, userId, profileId, finalCenterId });

        const suggestions = await participantSuggestionsService.getParticipantSuggestions(
          roles,
          userId,
          profileId,
          finalCenterId
        );

        setSuggestedUsers(suggestions);
      } catch (error) {
        console.error('❌ Error fetching participant suggestions:', error);
        setSuggestedUsers([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [isOpen, user?.roles, user?.id, profile, centerId]);

  const roomTypeOptions = [
    {
      value: ChatRoomType.DIRECT,
      label: 'Direct Message',
      description: 'One-on-one conversation',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      value: ChatRoomType.GROUP,
      label: 'Group Chat',
      description: 'Multiple participants',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      value: ChatRoomType.CONSULTATION,
      label: 'Consultation',
      description: 'Medical consultation room',
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      value: ChatRoomType.EMERGENCY,
      label: 'Emergency',
      description: 'Emergency response team',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      value: ChatRoomType.SUPPORT,
      label: 'Support',
      description: 'Technical support chat',
      icon: Headphones,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];


  const handleInputChange = (field: keyof CreateChatRoomDto, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Auto-set maxParticipants for Direct Messages
      if (field === 'type' && value === ChatRoomType.DIRECT) {
        updated.maxParticipants = 2;
      }

      return updated;
    });
  };


  const handleUsersChange = (users: User[]) => {
    setSelectedUsers(users);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate participants based on room type
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "Participants Required",
        description: "Please select at least one user to add to the chat room",
      });
      return;
    }

    if (formData.type === ChatRoomType.DIRECT && selectedUsers.length > 1) {
      toast({
        title: "Too Many Participants",
        description: "Direct messages can only have one other participant",
      });
      return;
    }

    // Generate room name if not provided - need to do this first
    let roomName = formData.name?.trim();
    if (!roomName) {
      if (formData.type === ChatRoomType.DIRECT) {
        // For direct messages, use the other participant's name
        const participant = selectedUsers[0];
        if (participant) {
          roomName = participant.name;
        } else {
          roomName = 'Unknown User';
        }
      } else {
        // For group chats, require a name
        toast({
          variant: "destructive",
          title: "Room Name Required",
          description: "Please enter a room name for group chats",
        });
        return;
      }
    }

    // Ensure the creator is included as a participant
    const creatorId = user?.id;
    const uniqueParticipantIds = Array.from(
      new Set([
        ...selectedUsers.map((u) => u.id),
        ...(creatorId ? [creatorId] : [])
      ])
    );

    const roomData: CreateChatRoomDto = {
      ...formData,
      name: roomName,
      participantIds: uniqueParticipantIds
    };

    console.log('🔍 Submitting room data:', roomData);

    // Check for existing Direct Message before creating new one
    if (formData.type === ChatRoomType.DIRECT && user?.id) {
      const otherUserId = selectedUsers[0].id;

      setCheckingExistingDM(true);

      try {
        // Try backend duplicate prevention first
        const result = await chatService.createChatRoom(roomData);

        console.log('✅ Room creation result:', result);

        // Close the modal
        handleClose();

        // Handle the result
        if (result.action === 'found') {
          console.log('🔄 Backend found existing DM, opening it');
          if (onOpenExistingRoom) {
            onOpenExistingRoom(result.room.id);
          }
          toast({
            title: "Existing Conversation",
            description: `Found existing conversation with ${selectedUsers[0].name}`,
          });
        } else {
          console.log('✅ Backend created new DM');
          toast({
            title: "Conversation Created",
            description: `Created new conversation with ${selectedUsers[0].name}`,
          });
          // Room is already created, just need to select it
          // Pass the actual created room result
          onCreateRoom(result.room || result);
        }

        return;
      } catch (error) {
        console.error('❌ Backend logic failed, trying frontend fallback:', error);

        // Frontend fallback: check for existing DM manually
        try {
          const existingRoom = await chatService.findExistingDirectMessage(user?.id, otherUserId);

          if (existingRoom) {
            console.log('🔄 Frontend fallback found existing DM, opening it');

            // Close the modal
            handleClose();

            // Open the existing room
            if (onOpenExistingRoom) {
              onOpenExistingRoom(existingRoom.id);
            } else {
              // Fallback: show a message
              toast({
                title: "Existing Conversation Found",
                description: `A direct message with ${selectedUsers[0].name} already exists. Opening existing conversation.`,
              });
            }

            return;
          }
        } catch (fallbackError) {
          console.error('❌ Frontend fallback also failed:', fallbackError);
          // Continue with creation if both fail
        }
      } finally {
        setCheckingExistingDM(false);
      }
    }

    // For non-DM rooms or in case duplicate check path wasn't taken (non-direct)
    // Prefer backend path: attempt to create via backend to get normalized room with participants.user.profile
    try {
      const result = await chatService.createChatRoom(roomData);
      // Close modal and open the resulting room
      handleClose();
      if (onOpenExistingRoom) {
        onOpenExistingRoom(result.room.id);
      } else {
        // Fallback to legacy path - convert ChatRoom to CreateChatRoomDto
        const roomDto: CreateChatRoomDto = {
          name: result.room.name,
          type: result.room.type,
          maxParticipants: result.room.maxParticipants,
          isEncrypted: result.room.isEncrypted,
          autoDeleteAfterDays: result.room.autoDeleteAfterDays,
          roomSettings: result.room.roomSettings,
          participantIds: result.room.participants?.map(p => p.userId) || [],
        };
        onCreateRoom(roomDto);
      }
      return;
    } catch (e) {
      // Final fallback to legacy create
      onCreateRoom(roomData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: ChatRoomType.DIRECT,
      maxParticipants: 2,
      isEncrypted: true,
      autoDeleteAfterDays: 1825, // 5 years default
      roomSettings: {
        allowFileSharing: true,
        allowVideoCalls: true,
        requireApproval: false
      },
      participantIds: []
    });
    setSelectedUsers([]);
    setSuggestedUsers([]);
    setLoadingSuggestions(false);
    setCheckingExistingDM(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[155]">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create New Chat Room</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Room Type Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Room Type
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roomTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.type === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleInputChange('type', option.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${option.bgColor}`}>
                          <Icon className={`h-5 w-5 ${option.color}`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Name - Only show for non-direct messages */}
            {formData.type !== ChatRoomType.DIRECT && (
              <div>
                <Label htmlFor="roomName" className="text-sm font-medium text-gray-700">
                  Room Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="roomName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter room name"
                  className="mt-1"
                  required
                />
                {!formData.name?.trim() && (
                  <p className="text-sm text-red-500 mt-1">Room name is required</p>
                )}
              </div>
            )}





            {/* Participants Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Add Participants
              </Label>
              <UserSelector
                selectedUsers={selectedUsers}
                onUsersChange={handleUsersChange}
                centerId={centerId}
                placeholder={
                  formData.type === ChatRoomType.DIRECT
                    ? "Search for a user to start a direct message..."
                    : "Search users to add to the chat room..."
                }
                maxUsers={formData.type === ChatRoomType.DIRECT ? 1 : (formData.maxParticipants || 10) - 1}
                disabled={loading}
                suggestedUsers={suggestedUsers}
                loadingSuggestions={loadingSuggestions}
              />
              {selectedUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {formData.type === ChatRoomType.DIRECT
                    ? "Select a user to start a direct message"
                    : "Select at least one user to create the chat room"
                  }
                </p>
              )}
              {formData.type === ChatRoomType.DIRECT && selectedUsers.length > 1 && (
                <p className="text-sm text-red-500 mt-2">
                  Direct messages can only have one other participant
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 pb-24 sm:pb-0 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || checkingExistingDM}>
                {checkingExistingDM ? 'Checking...' : loading ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRoomModal;
