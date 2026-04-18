import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  MessageCircle,
  Phone,
  Send,
  Paperclip,
  FileText,
  MoreVertical,
  Check,
  CheckCheck,
  Search,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnreadCountBadge } from "@/components/ui/unread-count-badge";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage?: {
    text: string;
    timestamp: Date;
    unread: boolean;
  };
  unreadCount?: number;
  status: "online" | "offline" | "away";
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "file" | "audio";
  fileUrl?: string;
  fileName?: string;
}

export const ChatInterface = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("messages");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for contacts
  useEffect(() => {
    const mockContacts: Contact[] = [];

    setContacts(mockContacts);
  }, []);

  // Mock messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: Message[] = [];

      setMessages(mockMessages);

      // Mark the contact's last message as read
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === selectedContact.id
            ? {
              ...contact,
              lastMessage: contact.lastMessage
                ? { ...contact.lastMessage, unread: false }
                : undefined
            }
            : contact
        )
      );
    }
  }, [selectedContact, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);

    // Reset unread count when chat is opened
    if (contact.unreadCount && contact.unreadCount > 0) {
      setContacts(prevContacts =>
        prevContacts.map(c =>
          c.id === contact.id
            ? { ...c, unreadCount: 0, lastMessage: c.lastMessage ? { ...c.lastMessage, unread: false } : undefined }
            : c
        )
      );
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: user?.id || "current-user",
      receiverId: selectedContact.id,
      text: inputMessage.trim(),
      timestamp: new Date(),
      status: "sent",
      type: "text"
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simulate receiving a response
    if (selectedContact) {
      setTimeout(() => {
        const responseMessage: Message = {
          id: `m${Date.now() + 1}`,
          senderId: selectedContact.id,
          receiverId: user?.id || "current-user",
          text: "Thank you for your message. I'll get back to you shortly.",
          timestamp: new Date(),
          status: "delivered",
          type: "text"
        };

        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleInitiateCall = (type: 'audio' | 'video') => {
    if (!selectedContact) return;

    if (type === 'video') {
      toast({
        title: "Booking Required",
        description: `Video consultations with ${selectedContact.name} require a confirmed appointment and payment. Please book a session from the Dashboard first.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${type === 'audio' ? 'Audio' : 'Video'} call initiated`,
      description: `Calling ${selectedContact.name}...`,
    });
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderId === (user?.id || "current-user");

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 sm:mb-4`}
      >
        {!isCurrentUser && (
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-1 sm:mr-2 flex-shrink-0">
            <AvatarImage src={selectedContact?.avatar || `/images/avatars/default.jpg`} alt={selectedContact?.name || 'Contact'} />
            <AvatarFallback>{selectedContact?.name?.charAt(0) || 'C'}</AvatarFallback>
          </Avatar>
        )}

        <div className="max-w-[75%] sm:max-w-[70%]">
          <div className={`rounded-lg p-2 sm:p-3 ${isCurrentUser
            ? 'bg-healthcare-500 text-white'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {message.type === 'text' && (
              <p className="text-xs sm:text-sm">{message.text}</p>
            )}

            {message.type === 'file' && (
              <div className="flex items-center bg-white bg-opacity-10 rounded p-1 sm:p-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm truncate">{message.fileName}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0">
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 space-x-1">
            <span>{formatTime(message.timestamp)}</span>
            {isCurrentUser && getStatusIcon(message.status)}
          </div>
        </div>

        {isCurrentUser && (
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ml-1 sm:ml-2 flex-shrink-0">
            <AvatarImage
              src={(() => {
                const imageUrl = profile?.image_url;
                if (imageUrl && typeof imageUrl === 'string') return imageUrl;
                const role = profile?.role || 'patient';
                return `/images/avatars/${role}.jpg`;
              })()}
              alt={profile?.name || 'User'}
            />
            <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="w-full px-0 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Communications</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4 px-4 sm:px-0">
          <TabsList className="w-full min-w-[350px]">
            <TabsTrigger value="messages" className="text-xs sm:text-sm py-2 flex-1 h-10">
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="calls" className="text-xs sm:text-sm py-2 flex-1 h-10">
              <Phone className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Calls</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs sm:text-sm py-2 flex-1 h-10">
              <Video className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Video Consultations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="messages" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border rounded-none sm:rounded-lg overflow-hidden shadow-sm" style={{ height: "calc(80vh - 140px)" }}>
            {/* Contact list - hidden by default on mobile if chat is open */}
            <div className={`border-r ${selectedContact ? 'hidden md:block' : 'block'}`}>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="h-full overflow-y-auto" style={{ maxHeight: "calc(80vh - 190px)" }}>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer border-b ${selectedContact?.id === contact.id ? "bg-gray-50" : ""
                        }`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={contact.avatar || `/images/avatars/default.jpg`} alt={contact.name || 'Contact'} />
                          <AvatarFallback>{contact.name?.charAt(0) || 'C'}</AvatarFallback>
                        </Avatar>
                        {contact.status === "online" && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                        {contact.status === "away" && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-yellow-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-xs sm:text-sm">{contact.name}</h3>
                            <p className="text-xs text-muted-foreground">{contact.role}</p>
                          </div>
                          {contact.lastMessage && (
                            <div className="text-xs text-muted-foreground">
                              {formatTime(contact.lastMessage.timestamp)}
                            </div>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs sm:text-sm truncate text-muted-foreground" style={{ maxWidth: "80%" }}>
                              {contact.lastMessage.text}
                            </p>
                            <UnreadCountBadge count={contact.unreadCount || 0} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No contacts match your search
                  </div>
                )}
              </div>
            </div>

            {/* Chat area - full width on mobile if chat is open */}
            <div className={`${selectedContact ? 'block' : 'hidden md:block'} md:col-span-2 flex flex-col h-full`}>
              {selectedContact ? (
                <>
                  {/* Chat header */}
                  <div className="p-2 sm:p-3 border-b flex justify-between items-center">
                    <div className="flex items-center">
                      {/* Back button - only visible on mobile */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-1 md:hidden p-1"
                        onClick={() => setSelectedContact(null)}
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                      </Button>

                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                        <AvatarImage src={selectedContact.avatar || `/images/avatars/default.jpg`} alt={selectedContact.name || 'Contact'} />
                        <AvatarFallback>{selectedContact.name?.charAt(0) || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="ml-2 sm:ml-3">
                        <h3 className="font-medium text-sm sm:text-base">{selectedContact.name}</h3>
                        <div className="flex items-center">
                          <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${selectedContact.status === "online" ? "bg-green-500" :
                            selectedContact.status === "away" ? "bg-yellow-500" :
                              "bg-gray-300"
                            }`}></span>
                          <span className="text-xs text-muted-foreground ml-1 capitalize">
                            {selectedContact.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-0 sm:space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleInitiateCall('audio')}>
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleInitiateCall('video')}>
                        <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col" style={{ maxHeight: "calc(80vh - 245px)" }}>
                    {messages.map((message, index, array) => {
                      // Check if we need to display a date separator
                      const showDateSeparator = index === 0 ||
                        formatMessageDate(message.timestamp) !== formatMessageDate(array[index - 1].timestamp);

                      return (
                        <React.Fragment key={message.id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-2 sm:my-4">
                              <Badge variant="outline" className="bg-white text-xs">
                                {formatMessageDate(message.timestamp)}
                              </Badge>
                            </div>
                          )}
                          {renderMessage(message)}
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="border-t p-2 sm:p-3">
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                        <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 mx-1 sm:mx-2 h-8 sm:h-10 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                      >
                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                  <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium">No Conversation Selected</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md">
                    Select a contact from the list to start a conversation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="mt-0">
          <Card className="rounded-none sm:rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Call History</CardTitle>
              <CardDescription className="text-sm">
                View your recent calls and make new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
              <Phone className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium">Call Functionality Coming Soon</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center max-w-md">
                Audio call functionality is currently under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <Card className="rounded-none sm:rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Video Consultations</CardTitle>
              <CardDescription className="text-sm">
                Schedule and join video consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
              <Video className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium">Video Consultation Coming Soon</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center max-w-md">
                Video consultation functionality is currently under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
