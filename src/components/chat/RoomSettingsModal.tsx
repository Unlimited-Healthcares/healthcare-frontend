import React, { useState } from 'react';
import { X, Shield, Archive, Trash2, UserMinus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatRoom, ChatRoomType, ParticipantRole } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';

interface RoomSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: ChatRoom | null;
    onUpdateRoom: (updatedRoom: ChatRoom) => void;
    onDeleteRoom: (roomId: string) => void;
    onArchiveRoom: (roomId: string) => void;
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
    isOpen,
    onClose,
    room,
    onUpdateRoom,
    onDeleteRoom,
    onArchiveRoom,
}) => {
    const { user } = useAuth();
    const [roomName, setRoomName] = useState(room?.name || '');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !room) return null;

    const isOwner = room.participants.find(p => p.userId === user?.id)?.role === ParticipantRole.ADMIN;

    const handleUpdateName = async () => {
        if (!roomName.trim() || roomName === room.name) return;
        setIsUpdating(true);
        try {
            await chatService.updateRoom(room.id, { name: roomName });
            toast.success('Room name updated');
            onUpdateRoom({ ...room, name: roomName });
        } catch (error) {
            toast.error('Failed to update room name');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleArchive = async () => {
        try {
            await chatService.archiveRoom(room.id);
            toast.success('Room archived');
            onArchiveRoom(room.id);
            onClose();
        } catch (error) {
            toast.error('Failed to archive room');
        }
    };

    const handleLeave = async () => {
        try {
            const participant = room.participants.find(p => p.userId === user?.id);
            if (participant) {
                await chatService.removeParticipant(room.id, participant.id);
                toast.success('You have left the room');
                onDeleteRoom(room.id);
                onClose();
            }
        } catch (error) {
            toast.error('Failed to leave room');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[155]">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Room Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Room Info */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {room.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Room Name</p>
                            <div className="flex gap-2">
                                <Input
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    disabled={!isOwner || room.type === ChatRoomType.DIRECT}
                                    className="bg-transparent border-none p-0 focus-visible:ring-0 font-bold text-gray-900 h-auto text-lg"
                                />
                                {isOwner && room.type !== ChatRoomType.DIRECT && roomName !== room.name && (
                                    <Button size="sm" onClick={handleUpdateName} disabled={isUpdating}>Save</Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{room.type} room · {room.participants.length} participants</p>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            Security & Privacy
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Archive className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Archive Chat</p>
                                        <p className="text-[10px] text-gray-500">Hide this chat from your active list</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={handleArchive}>Archive</Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white border border-rose-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-50 rounded-lg">
                                        <UserMinus className="h-4 w-4 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-rose-900">Leave Room</p>
                                        <p className="text-[10px] text-gray-500">Exit this conversation permanently</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={handleLeave}>Leave</Button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Display */}
                    <div className="pt-4 border-t border-gray-100 italic text-[10px] text-gray-400 text-center uppercase tracking-widest">
                        Room ID: {room.id} · Created {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <Button onClick={onClose} className="rounded-xl">Close Settings</Button>
                </div>
            </div>
        </div>
    );
};

export default RoomSettingsModal;
