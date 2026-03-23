import React, { useState } from 'react';

const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The hard days are the best because that's when champions are made.",
  "Success is what comes after you stop making excuses.",
  "Train insane or remain the same.",
  "Don't stop when you're tired. Stop when you're done.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Your only limit is your mind."
];

export const MotivationQuote: React.FC = () => {
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="glass-card p-4">
      <p className="text-sm text-gray-300 italic">"{quote}"</p>
      <p className="text-xs text-teal-400 mt-2">- AI Coach</p>
    </div>
  );
};

export default MotivationQuote;
