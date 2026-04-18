import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Send,
  Mic,
  Bot,
  User,
  Loader2,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock responses for demonstration purposes
const mockResponses: Record<string, string> = {};

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Suggestion {
  text: string;
  action?: () => void;
}

interface HealthcenterSuggestion {
  id: string;
  name: string;
  type: string;
  distance: string;
  address: string;
  rating: number;
  image?: string;
}

export const AIChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Healthcare Assistant. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [centerSuggestions, setCenterSuggestions] = useState<HealthcenterSuggestion[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock healthcare centers
  const mockCenters: HealthcenterSuggestion[] = [];

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Process message to determine if we should show healthcare centers
    const lowerCaseInput = inputValue.toLowerCase();
    if (
      lowerCaseInput.includes('near me') ||
      lowerCaseInput.includes('closest') ||
      lowerCaseInput.includes('nearest')
    ) {
      if (!locationEnabled) {
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: Date.now().toString(),
            content: "To find healthcare centers near you, I'll need access to your location. Would you like to enable location services?",
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
          setSuggestions([
            {
              text: "Enable location",
              action: () => {
                setLocationEnabled(true);
                handleLocationEnabled();
              }
            },
            { text: "No thanks" }
          ]);
          setIsTyping(false);
        }, 1000);
        return;
      } else {
        setTimeout(() => {
          handleLocationEnabled();
        }, 1000);
        return;
      }
    }

    // Simple response mechanism for demonstration
    setTimeout(() => {
      let foundResponse = false;

      // Check for keywords in the message
      for (const [keyword, response] of Object.entries(mockResponses)) {
        if (lowerCaseInput.includes(keyword)) {
          const aiResponse: ChatMessage = {
            id: Date.now().toString(),
            content: response,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiResponse]);
          foundResponse = true;

          // Set contextual suggestions based on the keyword
          if (keyword === 'appointment') {
            setSuggestions([
              { text: "General practitioner" },
              { text: "Cardiologist" },
              { text: "Dermatologist" },
              { text: "Pediatrician" }
            ]);
          } else if (keyword === 'headache' || keyword === 'fever') {
            setSuggestions([
              { text: "For 1-2 days" },
              { text: "For a week" },
              { text: "With other symptoms" },
              { text: "It's severe" }
            ]);
          } else if (keyword === 'blood test') {
            handleLocationEnabled();
          } else {
            setSuggestions([]);
          }

          break;
        }
      }

      // If no specific response was found
      if (!foundResponse) {
        const aiResponse: ChatMessage = {
          id: Date.now().toString(),
          content: "I understand you're asking about something health-related. Could you provide more details so I can assist you better?",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }

      setIsTyping(false);
    }, 1500);
  };

  const handleLocationEnabled = () => {
    const aiResponse: ChatMessage = {
      id: Date.now().toString(),
      content: "I found these healthcare centers near your location:",
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setCenterSuggestions(mockCenters);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleVoiceInput = () => {
    // In a real implementation, this would connect to the browser's speech recognition API
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInputValue("I need to find a doctor near me");
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full px-0 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">AI Nurse Assistant</h1>
      <Card className="h-[75vh] flex flex-col rounded-none sm:rounded-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-healthcare-100">
                <AvatarImage src="/images/avatars/nurse-assistant.jpg" />
                <AvatarFallback className="bg-healthcare-100 text-healthcare-800">
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>AI Nurse Assistant</CardTitle>
                <CardDescription>AI-powered healthcare guidance</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4 flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      flex max-w-[80%] items-start space-x-2
                      ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}
                    `}
                  >
                    <Avatar className={`h-8 w-8 ${message.sender === 'ai' ? 'bg-healthcare-100' : 'bg-primary/10'}`}>
                      {message.sender === 'ai' ? (
                        <>
                          <AvatarImage src="/images/avatars/nurse-assistant.jpg" />
                          <AvatarFallback className="bg-healthcare-100 text-healthcare-800">
                            <Bot size={16} />
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback>
                          <User size={16} />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div>
                      <div
                        className={`
                          rounded-lg p-3 text-sm
                          ${message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                          }
                        `}
                      >
                        {message.content}
                      </div>
                      <div
                        className={`
                          text-xs text-muted-foreground mt-1
                          ${message.sender === 'user' ? 'text-right' : ''}
                        `}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-8 w-8 bg-healthcare-100">
                      <AvatarFallback className="bg-healthcare-100 text-healthcare-800">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Healthcare Center Suggestions */}
              {centerSuggestions.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-start space-x-2">
                    <Avatar className="h-8 w-8 bg-healthcare-100">
                      <AvatarImage src="/images/avatars/nurse-assistant.jpg" />
                      <AvatarFallback className="bg-healthcare-100 text-healthcare-800">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      {centerSuggestions.map((center) => (
                        <div key={center.id} className="rounded-lg bg-muted p-3 hover:bg-muted/80 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{center.name}</h4>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Badge variant="outline" className="mr-2 text-[10px]">{center.type}</Badge>
                                <MapPin className="h-3 w-3 mr-1" />
                                {center.distance}
                                <span className="mx-1">•</span>
                                {center.rating} ★
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{center.address}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">Available today</span>
                            <Button size="sm" variant="default" className="h-7">
                              Book <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {suggestions.length > 0 && (
          <div className="px-6 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-7 bg-muted/50 border-muted-foreground/20"
                  onClick={() => suggestion.action ? suggestion.action() : handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        <CardFooter className="pt-0">
          <div className="relative flex w-full items-center">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-20"
            />
            <div className="absolute right-1 flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                    >
                      {isListening ? (
                        <Loader2 className="h-4 w-4 animate-spin text-healthcare-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="button"
                size="icon"
                className="h-8 w-8"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
