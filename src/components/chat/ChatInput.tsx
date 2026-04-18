import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Video,
  Phone,
  X,
  Image,
  File,
  Video as VideoIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageType } from '@/types/chat';

interface ChatInputProps {
  onSendMessage: (content: string, messageType?: MessageType) => void;
  onSendFile: (file: File) => void;
  onStartVideoCall: () => void;
  onStartAudioCall: () => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  // Edit mode support
  editMode?: {
    isEditing: boolean;
    originalMessageId: string | null;
    originalContent: string;
    onSaveEdit: (newContent: string) => void;
    onCancelEdit: () => void;
  };
  // Remote typing text (e.g., "John is typing...")
  remoteTypingText?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  onStartVideoCall,
  onStartAudioCall,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  editMode,
  remoteTypingText
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Load content when entering edit mode
  useEffect(() => {
    if (editMode?.isEditing) {
      setMessage(editMode.originalContent || '');
      textareaRef.current?.focus();
    }
  }, [editMode?.isEditing, editMode?.originalContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear typing indicator after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      if (selectedFiles.length > 0) {
        // Send files first
        selectedFiles.forEach(file => {
          onSendFile(file);
        });
        setSelectedFiles([]);
      }

      if (message.trim()) {
        if (editMode?.isEditing) {
          editMode.onSaveEdit(message.trim());
        } else {
          onSendMessage(message.trim());
        }
        setMessage('');
      }

      // Clear typing indicator
      setIsTyping(false);
      onTyping(false);
    }
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for others
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is ${isVideo ? '100MB' : '10MB'}`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type.startsWith('video/')) {
      return <VideoIcon className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {editMode?.isEditing && (
        <div className="mb-2 flex items-center justify-between rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <div className="truncate">Editing message</div>
          <Button variant="ghost" size="sm" onClick={editMode.onCancelEdit} className="h-6 px-2 text-blue-700">Cancel</Button>
        </div>
      )}
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFiles([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* File Upload Button */}
        <div className="flex items-center space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-10 w-10 p-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={disabled} className="h-10 w-10 p-0">
                <Smile className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onStartVideoCall}>
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStartAudioCall}>
                <Phone className="h-4 w-4 mr-2" />
                Start Audio Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none pr-12"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-6 w-6 p-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          className="h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Typing Indicator */}
      {(remoteTypingText || (isTyping && !editMode?.isEditing)) && (
        <div className="mt-2 text-xs text-gray-500">
          {remoteTypingText || 'Typing...'}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
