import React, { useState, useRef } from 'react';
import { X, User, UserCheck, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatParticipantSuggestion } from '@/types/chat';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  centerId?: string;
}

interface UserSelectorProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
  centerId?: string;
  placeholder?: string;
  maxUsers?: number;
  disabled?: boolean;
  suggestedUsers?: ChatParticipantSuggestion[];
  loadingSuggestions?: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onUsersChange,
  centerId,
  placeholder,
  maxUsers = 10,
  disabled = false,
  suggestedUsers = [],
  loadingSuggestions = false
}) => {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Deduplicate suggestions by id and exclude already selected users
  const uniqueSuggestions: ChatParticipantSuggestion[] = React.useMemo(() => {
    const seen = new Set<string>();
    const deduped: ChatParticipantSuggestion[] = [];
    for (const s of suggestedUsers) {
      if (!s || !s.id) continue;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      // Exclude users already selected
      if (selectedUsers.some((u) => u.id === s.id)) continue;
      deduped.push(s);
    }
    return deduped;
  }, [suggestedUsers, selectedUsers]);


  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      return; // User already selected
    }

    if (selectedUsers.length >= maxUsers) {
      return;
    }

    onUsersChange([...selectedUsers, user]);
  };

  const handleSuggestionSelect = (suggestion: ChatParticipantSuggestion) => {
    const user: User = {
      id: suggestion.id,
      name: suggestion.name,
      email: suggestion.email,
      avatar: suggestion.avatar,
      role: suggestion.role,
      centerId: centerId
    };
    handleUserSelect(user);
  };

  const handleUserRemove = (userId: string) => {
    onUsersChange(selectedUsers.filter(u => u.id !== userId));
  };



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search input (optional UI for placeholder usage) */}
      {placeholder && (
        <div className="mb-2">
          <div className="text-xs text-gray-500">{placeholder}</div>
        </div>
      )}
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => handleUserRemove(user.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

          {/* Suggested Participants Dropdown */}
          {uniqueSuggestions.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
                className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={disabled}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Suggested Participants</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {uniqueSuggestions.length}
                  </span>
                </div>
                {isSuggestionsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isSuggestionsOpen && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                  {uniqueSuggestions.map(suggestion => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      disabled={disabled}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {suggestion.avatar ? (
                          <img
                            src={suggestion.avatar}
                            alt={suggestion.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {suggestion.name
                                .split(' ')
                                .map(word => word.charAt(0))
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.name}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {suggestion.role}
                          </span>
                        </div>
                      </div>
                      {selectedUsers.find(u => u.id === suggestion.id) && (
                        <div className="flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State for Suggestions */}
          {loadingSuggestions && suggestedUsers.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">Loading suggestions...</h3>
                <div className="ml-auto">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State for Suggestions */}
          {!loadingSuggestions && suggestedUsers.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">Suggested Participants</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  0
                </span>
              </div>
              <div className="mt-2 border border-gray-300 rounded-lg bg-white p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4" />
                  <p className="text-sm">No available contacts to chat with yet</p>
                </div>
              </div>
            </div>
          )}

    </div>
  );
};

export default UserSelector;
