import React from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center text-xs">
              AI
            </div>
            <span className="ml-2 text-xs text-gray-400">AI Coach</span>
          </div>
        )}
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'gradient-bg text-white rounded-tr-none'
              : 'bg-white/5 text-gray-200 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

