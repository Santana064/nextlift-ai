import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  videos?: { id: string; title: string; url: string }[];
  image?: string;
}

// ========== RELIABLE YOUTUBE VIDEO DATABASE (WORKING LINKS) ==========
const exerciseVideos: Record<string, { id: string; title: string; url: string }[]> = {
  squat: [
    { id: 'bs_Ej32I5VI', title: 'How to Squat with Proper Form', url: 'https://www.youtube.com/watch?v=bs_Ej32I5VI' }
  ],
  bench: [
    { id: 'gRVjAtPp6eQ', title: 'Bench Press Form Tutorial', url: 'https://www.youtube.com/watch?v=gRVjAtPp6eQ' }
  ],
  deadlift: [
    { id: 'op9kVnSsoLQ', title: 'Deadlift Form Tutorial', url: 'https://www.youtube.com/watch?v=op9kVnSsoLQ' }
  ],
  'chest fly': [
    { id: 'n7jYyS3z3A0', title: 'Chest Fly - Proper Form Guide', url: 'https://www.youtube.com/watch?v=n7jYyS3z3A0' }
  ],
  'cable fly': [
    { id: 'n7jYyS3z3A0', title: 'Cable Fly Form Guide', url: 'https://www.youtube.com/watch?v=n7jYyS3z3A0' }
  ],
  pushup: [
    { id: 'IODxDxX7oi4', title: 'How to Do Push Ups Correctly', url: 'https://www.youtube.com/watch?v=IODxDxX7oi4' }
  ],
  pullup: [
    { id: 'l1w8J_6wUzI', title: 'Pull Up Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=l1w8J_6wUzI' }
  ],
  'overhead press': [
    { id: '2z8NnQlE8U4', title: 'Overhead Press Form Guide', url: 'https://www.youtube.com/watch?v=2z8NnQlE8U4' }
  ],
  row: [
    { id: 'G8l_8chR5BE', title: 'Barbell Row Technique', url: 'https://www.youtube.com/watch?v=G8l_8chR5BE' }
  ]
};

// Fallback search function
const getYouTubeSearchUrl = (query: string): string => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' exercise form tutorial')}`;
};

// ========== EXERCISE FORM DATABASE ==========
const exerciseFormDatabase: Record<string, { description: string; cues: string[]; mistakes: string[]; tips: string[]; videoSearch: string }> = {
  'chest fly': {
    description: "Chest fly is an isolation exercise that targets the pectoral muscles through a hugging motion.",
    cues: [
      "Lie on bench with dumbbells above chest, palms facing each other",
      "Keep a slight bend in elbows throughout",
      "Lower arms out to sides in a wide arc",
      "Imagine hugging a tree as you bring dumbbells back together",
      "Squeeze chest at the top"
    ],
    mistakes: [
      "Locking elbows (puts stress on joints)",
      "Using too much weight (causes shoulder strain)",
      "Letting shoulders round forward",
      "Bouncing at the bottom"
    ],
    tips: [
      "Start light to master the movement",
      "Focus on mind-muscle connection",
      "Control the negative for 2-3 seconds",
      "Squeeze hard at the top"
    ],
    videoSearch: "chest fly exercise form"
  },
  'cable fly': {
    description: "Cable fly provides constant tension throughout the movement for better muscle activation.",
    cues: [
      "Set cables at appropriate height",
      "Stand with staggered stance for stability",
      "Keep slight bend in elbows",
      "Pull cables together in a hugging motion",
      "Squeeze chest at the peak contraction"
    ],
    mistakes: [
      "Using momentum instead of control",
      "Letting shoulders roll forward",
      "Not maintaining tension",
      "Arching back excessively"
    ],
    tips: [
      "Adjust cable height for different chest regions",
      "Pause at peak contraction",
      "Control the return",
      "Vary hand position for different chest fibers"
    ],
    videoSearch: "cable fly exercise form"
  },
  'squat': {
    description: "The squat builds quads, hamstrings, and glutes - it's the king of leg exercises.",
    cues: [
      "Bar across upper back, not neck",
      "Feet shoulder-width apart",
      "Chest up, back straight",
      "Break at hips and knees simultaneously",
      "Lower until thighs parallel or deeper"
    ],
    mistakes: [
      "Knees caving inward",
      "Heels lifting off ground",
      "Rounded lower back",
      "Not reaching depth"
    ],
    tips: [
      "Warm up with mobility work",
      "Use lifting shoes if available",
      "Brace core before each rep",
      "Film yourself to check depth"
    ],
    videoSearch: "squat form tutorial"
  },
  'bench press': {
    description: "The bench press builds chest, shoulders, and triceps strength.",
    cues: [
      "Set up with eyes under the bar",
      "Retract shoulder blades",
      "Keep feet flat on floor",
      "Lower bar to mid-chest",
      "Drive through feet and press explosively"
    ],
    mistakes: [
      "Flaring elbows too wide",
      "Bouncing bar off chest",
      "Arching back excessively",
      "Not using leg drive"
    ],
    tips: [
      "Use a spotter for heavy sets",
      "Keep wrists straight",
      "Progress with 2.5kg increments",
      "Touch chest every rep"
    ],
    videoSearch: "bench press form tutorial"
  },
  'deadlift': {
    description: "The deadlift builds hamstrings, glutes, back, and traps.",
    cues: [
      "Bar over mid-foot",
      "Grip just outside shins",
      "Pull slack out of bar",
      "Keep back flat, chest up",
      "Drive through heels to lockout"
    ],
    mistakes: [
      "Rounded lower back",
      "Jerking the weight",
      "Hips rising too fast",
      "Not engaging lats"
    ],
    tips: [
      "Wear flat shoes or go barefoot",
      "Use chalk for grip",
      "Reset between reps",
      "Build up gradually"
    ],
    videoSearch: "deadlift form tutorial"
  },
  'pull up': {
    description: "Pull-ups build back width and strength, targeting lats and biceps.",
    cues: [
      "Start from dead hang",
      "Pull chest to bar, not chin",
      "Squeeze shoulder blades together",
      "Control the descent",
      "Keep core tight to prevent swinging"
    ],
    mistakes: [
      "Swinging for momentum",
      "Only going halfway",
      "Not engaging lats",
      "Dropping too fast"
    ],
    tips: [
      "Use bands if you can't do one",
      "Add weight when you can do 10+",
      "Practice negatives to build strength",
      "Vary grip for different muscle emphasis"
    ],
    videoSearch: "pull up form tutorial"
  }
};

// ========== NUTRITION DATABASE ==========
const nutritionInfo: Record<string, { answer: string; tips: string[] }> = {
  'post workout': {
    answer: "Post-workout nutrition focuses on replenishing glycogen and initiating muscle repair. The 'anabolic window' is about 2 hours after training.",
    tips: [
      "Protein: 20-40g for muscle repair",
      "Carbs: 30-60g to replenish glycogen",
      "Hydrate: Water + electrolytes",
      "Timing: Eat within 2 hours of training",
      "Sample: Protein shake + banana, or chicken + rice"
    ]
  },
  'pre workout': {
    answer: "Pre-workout nutrition fuels your training for optimal performance and energy.",
    tips: [
      "Eat 1-3 hours before training",
      "Carbs for energy (oatmeal, banana, rice cakes)",
      "Protein for amino acid availability",
      "Avoid heavy fats close to training",
      "Hydrate: Drink water throughout the day"
    ]
  },
  protein: {
    answer: "Protein is essential for muscle repair, growth, and recovery. Aim for consistent intake throughout the day.",
    tips: [
      "Daily target: 1.6-2.2g per kg bodyweight",
      "Spread across 3-5 meals",
      "20-40g per meal is optimal",
      "Whey post-workout for fast absorption",
      "Casein before bed for slow release",
      "Good sources: chicken, eggs, fish, Greek yogurt, tofu"
    ]
  },
  calories: {
    answer: "Calorie balance determines weight change: surplus for muscle gain, deficit for fat loss.",
    tips: [
      "Muscle gain: +250-500 calories above maintenance",
      "Fat loss: -300-500 calories below maintenance",
      "Track intake for 2 weeks to find maintenance",
      "Prioritize nutrient-dense foods",
      "Adjust based on progress, not feelings",
      "Protein intake stays high regardless of goal"
    ]
  }
};

// ========== INTENT DETECTION ==========
const detectIntent = (message: string): { type: string; entity?: string; wantsVideo?: boolean } => {
  const lower = message.toLowerCase();
  
  // Video request detection (only when explicitly asked)
  const wantsVideo = lower.includes('show me') || lower.includes('show') || lower.includes('watch') || 
                     lower.includes('video') || lower.includes('visual') || lower.includes('demonstrate') ||
                     lower.includes('see how') || lower.includes('what does it look like') ||
                     lower.includes('show video');
  
  // Exercise form queries
  const exerciseNames = ['squat', 'bench press', 'deadlift', 'pull up', 'push up', 'overhead press', 
                          'bicep curl', 'chest fly', 'cable fly', 'leg press', 'lat pulldown', 'row'];
  
  for (const exercise of exerciseNames) {
    if (lower.includes(exercise)) {
      return { type: 'exercise_form', entity: exercise, wantsVideo };
    }
  }
  
  // Nutrition queries
  if (lower.includes('post workout') || lower.includes('post-workout')) {
    return { type: 'nutrition', entity: 'post workout' };
  }
  if (lower.includes('pre workout') || lower.includes('pre-workout')) {
    return { type: 'nutrition', entity: 'pre workout' };
  }
  if (lower.includes('protein')) {
    return { type: 'nutrition', entity: 'protein' };
  }
  if (lower.includes('calories') || lower.includes('calorie')) {
    return { type: 'nutrition', entity: 'calories' };
  }
  
  // Workout plan queries
  if (lower.includes('workout') || lower.includes('routine') || lower.includes('plan')) {
    let focus = 'full';
    if (lower.includes('chest')) focus = 'chest';
    else if (lower.includes('back')) focus = 'back';
    else if (lower.includes('shoulder')) focus = 'shoulder';
    else if (lower.includes('leg')) focus = 'leg';
    else if (lower.includes('arm')) focus = 'arm';
    
    let goal = 'hypertrophy';
    if (lower.includes('strength')) goal = 'strength';
    
    let experience = 'intermediate';
    if (lower.includes('beginner')) experience = 'beginner';
    else if (lower.includes('advanced')) experience = 'advanced';
    
    return { type: 'workout_plan', entity: focus, goal, experience };
  }
  
  return { type: 'general' };
};

// ========== WORKOUT PLAN BUILDER ==========
const buildWorkoutPlan = (focus: string, goal: string, experience: string): string => {
  const workouts: Record<string, any> = {
    chest: {
      beginner: [
        "• Dumbbell Bench Press: 3x10-12",
        "• Incline Dumbbell Press: 3x10-12",
        "• Push-ups: 3x max",
        "• Cable Fly: 3x12-15"
      ],
      intermediate: [
        "• Barbell Bench Press: 3x8-10",
        "• Incline Dumbbell Press: 3x8-12",
        "• Weighted Dips: 3x8-12",
        "• Cable Fly: 3x12-15"
      ],
      advanced: [
        "• Barbell Bench Press: 4x6-8",
        "• Incline Barbell Press: 4x8-10",
        "• Dumbbell Fly: 3x10-12",
        "• Weighted Dips: 3x8-10",
        "• Cable Fly: 3x12-15"
      ]
    },
    back: {
      beginner: [
        "• Lat Pulldown: 3x10-12",
        "• Seated Cable Row: 3x10-12",
        "• Face Pulls: 3x12-15",
        "• Dumbbell Row: 3x10-12"
      ],
      intermediate: [
        "• Pull-ups: 3x max",
        "• Barbell Row: 3x8-10",
        "• Seated Cable Row: 3x10-12",
        "• Face Pulls: 3x12-15"
      ],
      advanced: [
        "• Weighted Pull-ups: 4x6-8",
        "• Pendlay Row: 4x6-8",
        "• T-Bar Row: 3x8-10",
        "• Chest-Supported Row: 3x10-12",
        "• Face Pulls: 3x12-15"
      ]
    },
    legs: {
      beginner: [
        "• Goblet Squat: 3x10-12",
        "• Leg Press: 3x10-12",
        "• Romanian Deadlift: 3x10-12",
        "• Leg Curl: 3x12-15"
      ],
      intermediate: [
        "• Barbell Squat: 3x8-10",
        "• Romanian Deadlift: 3x8-10",
        "• Leg Press: 3x10-12",
        "• Walking Lunges: 3x10/leg"
      ],
      advanced: [
        "• Back Squat: 4x6-8",
        "• Front Squat: 3x8-10",
        "• Romanian Deadlift: 3x8-10",
        "• Bulgarian Split Squat: 3x8-10/leg",
        "• Leg Curl: 3x10-12"
      ]
    }
  };
  
  const selectedWorkout = workouts[focus]?.[experience] || workouts.chest.intermediate;
  
  let goalAdvice = "";
  if (goal === 'strength') {
    goalAdvice = "Focus on 1-5 reps, 3-5 min rest, add weight weekly";
  } else {
    goalAdvice = "Focus on 8-12 reps, 60-90 sec rest, add reps before weight";
  }
  
  return `**🏋️ ${focus.toUpperCase()} WORKOUT (${experience.toUpperCase()} - ${goal.toUpperCase()})**

**Warm-up:** 5-10 mins light cardio + dynamic stretching

**Workout:**
${selectedWorkout.map((ex: string) => `• ${ex}`).join('\n')}

**Progression:**
${goalAdvice}

**Key Tips:**
• Control the negative (2-3 seconds down)
• Focus on form over weight
• Track your lifts
• Rest 48-72 hours before training same muscle group`;
};

// ========== MAIN CHAT COMPONENT ==========
const Chat: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `**🏆 Ultimate AI Fitness Coach**

I can help you with:
• **Workout Plans** - "Chest workout for size" or "Strength leg routine"
• **Exercise Form** - "How to squat?" or "Chest fly form"
• **Nutrition** - "Post-workout meal" or "How much protein?"
• **Videos** - "Show me deadlift video" (opens YouTube search)

**What would you like help with?**`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    
    if (!textToSend.trim()) {
      showToast('error', 'Please enter a message');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) {
      setInput('');
    }
    setIsTyping(true);

    setTimeout(() => {
      const intent = detectIntent(textToSend);
      let aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Handle exercise form queries
      if (intent.type === 'exercise_form' && intent.entity) {
        const exerciseKey = Object.keys(exerciseFormDatabase).find(key => 
          intent.entity?.toLowerCase().includes(key)
        );
        
        if (exerciseKey) {
          const data = exerciseFormDatabase[exerciseKey];
          aiMessage.text = `**💪 ${exerciseKey.toUpperCase()} FORM GUIDE**

**What it is:** ${data.description}

**Proper Form:**
${data.cues.map(cue => `• ${cue}`).join('\n')}

**Common Mistakes to Avoid:**
${data.mistakes.map(mistake => `• ${mistake}`).join('\n')}

**💡 Tips:**
${data.tips.map(tip => `• ${tip}`).join('\n')}`;

          // Add video only if explicitly requested - use search link to avoid broken videos
          if (intent.wantsVideo) {
            const searchUrl = getYouTubeSearchUrl(data.videoSearch);
            aiMessage.videos = [{
              id: 'search',
              title: `Search YouTube: ${exerciseKey} Tutorial`,
              url: searchUrl
            }];
            aiMessage.text += `\n\n**📹 Click above to search YouTube for "${exerciseKey} form tutorials"**`;
          }
        } else {
          aiMessage.text = `For ${intent.entity}, focus on proper form and controlled movement. Start with lighter weight to master the technique.`;
          if (intent.wantsVideo) {
            const searchUrl = getYouTubeSearchUrl(intent.entity);
            aiMessage.videos = [{
              id: 'search',
              title: `Search YouTube: ${intent.entity} Tutorial`,
              url: searchUrl
            }];
          }
        }
      }
      // Handle nutrition queries
      else if (intent.type === 'nutrition' && intent.entity) {
        const data = nutritionInfo[intent.entity];
        if (data) {
          aiMessage.text = `**🥗 NUTRITION: ${intent.entity.toUpperCase()}**

${data.answer}

**💡 Key Tips:**
${data.tips.map(tip => `• ${tip}`).join('\n')}`;
        } else {
          aiMessage.text = `**🥗 Nutrition Basics**

**Protein:** 1.6-2.2g per kg bodyweight
**Carbs:** 4-6g per kg for active individuals
**Fats:** 0.8-1g per kg
**Water:** 2-3L daily

Eat whole foods, time meals around training, and be consistent.`;
        }
      }
      // Handle workout plans
      else if (intent.type === 'workout_plan') {
        const plan = buildWorkoutPlan(intent.entity, intent.goal, intent.experience);
        aiMessage.text = plan;
      }
      // Default response
      else {
        aiMessage.text = `**💬 How can I help?**

Try one of these:
• **Workout:** "Chest workout for size" or "Strength leg routine"
• **Form:** "How to squat?" or "Chest fly form"
• **Nutrition:** "Post-workout meal" or "How much protein?"
• **Video:** "Show me deadlift video" (opens YouTube search)

What would you like to know?`;
      }
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const openVideo = (video: { url: string; title: string }) => {
    window.open(video.url, '_blank');
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      text: `**🏆 Ultimate AI Fitness Coach**

I can help you with:
• **Workout Plans** - "Chest workout for size" or "Strength leg routine"
• **Exercise Form** - "How to squat?" or "Chest fly form"
• **Nutrition** - "Post-workout meal" or "How much protein?"
• **Videos** - "Show me deadlift video" (opens YouTube search)

**What would you like help with?**`,
      sender: 'ai',
      timestamp: new Date()
    }]);
    showToast('success', 'Chat cleared');
  };

  const suggestions = [
    "Chest fly form",
    "How to squat?",
    "Show me deadlift video",
    "Post-workout meal",
    "Chest workout for size",
    "How much protein?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 h-[calc(100vh-120px)]">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl">🏋️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ultimate AI Coach</h2>
                <p className="text-sm text-gray-400">Workouts • Form • Nutrition • Video Search</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-1"
            >
              <span>🗑️</span>
              Clear Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                      : 'bg-gray-700/50 text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                  
                  {message.videos && message.videos.length > 0 && (
                    <div className="mt-4">
                      {message.videos.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => openVideo(video)}
                          className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-left w-full mt-2"
                        >
                          <div className="w-24 h-16 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{video.title}</p>
                            <p className="text-xs text-gray-400">Click to search YouTube</p>
                          </div>
                          <span className="text-gray-400">🔍</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs mt-2 opacity-50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-6 py-3 border-t border-gray-700/50">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-sm text-gray-300 rounded-full border border-gray-600/50 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything... 'Chest fly form', 'Post-workout meal', 'Show me deadlift video'"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Try: "Chest fly form" | "Post-workout meal" | "Show me deadlift video" | "Chest workout for size"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
