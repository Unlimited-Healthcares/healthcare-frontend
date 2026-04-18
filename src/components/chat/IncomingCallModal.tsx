import React, { useState, useEffect } from 'react';
import { Phone, Video, X, PhoneOff, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomingCallModalProps {
    isOpen: boolean;
    callerName: string;
    callerAvatar?: string | null;
    callType: 'video' | 'audio';
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
    isOpen,
    callerName,
    callerAvatar,
    callType,
    onAccept,
    onDecline
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Logic for playing ringtone could go here
            setIsPlaying(true);

            // Auto-decline after 30 seconds
            const timer = setTimeout(() => {
                onDecline();
            }, 30000);

            return () => {
                clearTimeout(timer);
                setIsPlaying(false);
            };
        }
    }, [isOpen, onDecline]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-sm border border-blue-100 dark:border-gray-800"
                >
                    <div className="p-8 flex flex-col items-center text-center">
                        {/* Animated Ringing Effect */}
                        <div className="relative mb-6">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full bg-blue-400/20"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute inset-0 rounded-full bg-blue-400/10"
                            />
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl relative z-10">
                                <AvatarImage src={callerAvatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                    {callerName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-20">
                                {callType === 'video' ? <Video className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {callerName}
                        </h2>
                        <p className="text-blue-500 font-medium animate-pulse mb-8">
                            Incoming {callType} call...
                        </p>

                        <div className="flex items-center justify-center space-x-12 w-full">
                            {/* Decline Button */}
                            <div className="flex flex-col items-center space-y-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={onDecline}
                                    className="h-16 w-16 rounded-full shadow-lg shadow-red-500/30 hover:scale-110 transition-transform"
                                >
                                    <PhoneOff className="h-7 w-7" />
                                </Button>
                                <span className="text-sm font-medium text-gray-500">Decline</span>
                            </div>

                            {/* Accept Button */}
                            <div className="flex flex-col items-center space-y-2">
                                <Button
                                    onClick={onAccept}
                                    className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
                                >
                                    {callType === 'video' ? <Video className="h-7 w-7 text-white" /> : <Phone className="h-7 w-7 text-white" />}
                                </Button>
                                <span className="text-sm font-medium text-gray-500">Accept</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                        <div className="flex items-center text-xs text-gray-400 space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                            <span>Secure Encrypted Connection</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default IncomingCallModal;
