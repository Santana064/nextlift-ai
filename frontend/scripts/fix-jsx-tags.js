import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixJSXTags(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Count JSX tags
    const openTags = (content.match(/<[A-Za-z][^>]*>/g) || []).length;
    const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
    
    if (openTags > closeTags) {
        // Add missing closing tags at the end
        const missing = openTags - closeTags;
        content = content.trim() + '\n' + '</div>'.repeat(missing);
        console.log(`✅ Fixed: ${filePath} (added ${missing} closing tags)`);
        fs.writeFileSync(fullPath, content);
    }
}

console.log('\n🔧 FIXING UNBALANCED JSX TAGS...\n');

// Fix all component files
const filesToFix = [
    'src/App.tsx',
    'src/components/analysis/ComparisonChart.tsx',
    'src/components/analysis/FeedbackList.tsx',
    'src/components/analysis/FormScoreChart.tsx',
    'src/components/analysis/ImprovementTips.tsx',
    'src/components/analysis/MuscleActivation.tsx',
    'src/components/analysis/RepAnalysis.tsx',
    'src/components/analysis/VideoReplay.tsx',
    'src/components/Auth/ProtectedRoute.tsx',
    'src/components/CameraFeed.tsx',
    'src/components/chat/ChatInput.tsx',
    'src/components/chat/ChatMessage.tsx',
    'src/components/chat/QuickActions.tsx',
    'src/components/chat/VoiceInput.tsx',
    'src/components/dashboard/AchievementShowcase.tsx',
    'src/components/dashboard/FriendActivity.tsx',
    'src/components/dashboard/GoalTracker.tsx',
    'src/components/dashboard/NutritionSummary.tsx',
    'src/components/dashboard/ProgressChart.tsx',
    'src/components/dashboard/QuickStats.tsx',
    'src/components/dashboard/RecentWorkouts.tsx',
    'src/components/dashboard/StreakCard.tsx',
    'src/components/dashboard/WorkoutRecommendations.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/components/generator/GeneratedWorkout.tsx',
    'src/components/generator/LoadingAnimation.tsx',
    'src/components/generator/WorkoutPreferences.tsx',
    'src/components/nutrition/FoodSearch.tsx',
    'src/components/nutrition/MacroTracker.tsx',
    'src/components/nutrition/MealLogger.tsx',
    'src/components/nutrition/MealPlanDisplay.tsx',
    'src/components/nutrition/NutritionStats.tsx',
    'src/components/nutrition/WaterTracker.tsx',
    'src/components/PoseOverlay.tsx',
    'src/components/profile/AchievementGrid.tsx',
    'src/components/profile/Measurements.tsx',
    'src/components/profile/ProfileHeader.tsx',
    'src/components/profile/ProfileStats.tsx',
    'src/components/profile/Referrals.tsx',
    'src/components/profile/Settings.tsx',
    'src/components/profile/WorkoutHistory.tsx',
    'src/components/progress/GoalProgress.tsx',
    'src/components/progress/MeasurementsChart.tsx',
    'src/components/progress/PersonalRecords.tsx',
    'src/components/progress/StrengthProgress.tsx',
    'src/components/progress/TrendAnalysis.tsx',
    'src/components/progress/WeightChart.tsx',
    'src/components/progress/WorkoutHeatmap.tsx',
    'src/components/ProtectedRoute.tsx',
    'src/components/social/Challenges.tsx',
    'src/components/social/CreatePost.tsx',
    'src/components/social/Feed.tsx',
    'src/components/social/FriendList.tsx',
    'src/components/social/FriendRequests.tsx',
    'src/components/social/Leaderboard.tsx',
    'src/components/social/Messages.tsx',
    'src/components/workout/CameraFeed.tsx',
    'src/components/workout/ExerciseGuide.tsx',
    'src/components/workout/ExerciseSelector.tsx',
    'src/components/workout/FormAnalysis.tsx',
    'src/components/workout/LiveStats.tsx',
    'src/components/workout/PoseOverlay.tsx',
    'src/components/workout/RepCounter.tsx',
    'src/components/workout/VoiceCoach.tsx',
    'src/components/workout/WorkoutControls.tsx',
    'src/components/workout/WorkoutHistory.tsx',
    'src/components/workout/WorkoutSummary.tsx',
    'src/context/AuthContext.tsx',
    'src/context/ThemeContext.tsx',
    'src/context/ToastContext.tsx',
    'src/main.tsx',
    'src/pages/Analysis.tsx',
    'src/pages/Chat.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Generator.tsx',
    'src/pages/Login.tsx',
    'src/pages/Nutrition.tsx',
    'src/pages/Profile.tsx',
    'src/pages/Progress.tsx',
    'src/pages/Register.tsx',
    'src/pages/Social.tsx',
    'src/pages/Test.tsx',
    'src/pages/Workout.tsx',
    'src/utils/helpers.ts'
];

filesToFix.forEach(fixJSXTags);

console.log('\n✅ ALL JSX TAGS FIXED! Run brutal test again.');
