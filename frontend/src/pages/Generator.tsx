import React, { useState } from 'react';

const Generator: React.FC = () => {
  const [preferences] = useState({
    goal: 'strength',
    duration: 45,
    equipment: [],
    focus: 'full_body'
  });

  return (
    <div className="generator-container">
      <h1>AI Workout Generator</h1>
      <div>Goal: {preferences.goal}</div>
      <div>Duration: {preferences.duration} min</div>
    </div>
  );
};

export default Generator;