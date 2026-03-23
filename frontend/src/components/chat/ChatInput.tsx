import React, { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoice?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onVoice, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-white/10">
      {onVoice && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onVoice}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition"
        >
          ðŸŽ¤
        </motion.button>
      )}
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-teal-400 text-white placeholder-gray-500"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="p-3 gradient-bg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ðŸ“¤
      </motion.button>
    </div>
  );
};

export default ChatInput;