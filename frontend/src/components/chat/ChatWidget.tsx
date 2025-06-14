import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, SendHorizonal, X } from 'lucide-react';
import api from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
const LOCAL_SESSION_KEY = 'ladicare_chat_session';

interface ChatApiResponse {
    messages: Array<{
        sessionId: string;
        sender: string;
        content: string;
        timestamp?: string;
    }>;
}
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const chatBodyRef = useRef<HTMLDivElement | null>(null);
    const sessionId = useRef((() => {
        let id = localStorage.getItem(LOCAL_SESSION_KEY);
        if (!id) {
            id = uuidv4();
            localStorage.setItem(LOCAL_SESSION_KEY, id);
        }
        return id;
    })());
    const [messages, setMessages] = useState<ChatApiResponse['messages']>([]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await api.get(`/chat?sessionId=${sessionId.current}`) as ChatApiResponse;
                setMessages(res.messages.length > 0 ? res.messages : [{
                    sessionId: sessionId.current,
                    sender: 'system',
                    content: 'Welcome! How can we assist you today?',
                }]);
            } catch (err) {
                console.error('Failed to load chat messages:', err);
            }
        };

        loadMessages();
    }, [isOpen, sessionId]);

    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessage = {
            sessionId: sessionId.current,
            sender: 'user',
            content: input,
        };

        try {
            await api.post('/chat', newMessage);
            setMessages([...messages, { ...newMessage, timestamp: new Date().toISOString() }]);
            setInput('');
            scrollToBottom();
        } catch (err) {
            console.error('Message send failed:', err);
        }
    };

    const messageCount = messages.length;
    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                    }}
                    className="relative bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all"
                >
                    <MessageCircle className="w-6 h-6" />
                    {messageCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1.5 py-0.5">
                            {messageCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-up">
                    <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
                        <h3 className="font-semibold">Chat with us</h3>
                        <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
                    </div>

                    <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <div
                                    className={`inline-block px-3 py-2 rounded-lg max-w-xs ${msg.sender === 'user'
                                        ? 'bg-purple-100 text-purple-800 ml-auto'
                                        : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center p-3 border-t">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border rounded-lg mr-2 text-sm"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
                        >
                            <SendHorizonal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
