export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCalories = (calories: number): string => {
  return new Intl.NumberFormat().format(calories);
};

export const calculateBMI = (weight: number, height: number): number => {
  // height in cm, weight in kg
  const heightInM = height / 100;
  return Number((weight / (heightInM * heightInM)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateCalories = (
  exercise: string,
  weight: number,
  duration: number
): number => {
  // Simplified MET calculation
  const metValues: Record<string, number> = {
    squat: 5,
    bench_press: 4,
    deadlift: 5,
    running: 8,
    cycling: 6
  };
  
  const met = metValues[exercise] || 4;
  return Math.round((met * 3.5 * weight * duration) / 200);
};

export const calculateOneRM = (weight: number, reps: number): number => {
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const shareToSocial = async (text: string, url?: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'NEXTLIFT AI',
        text,
        url: url || window.location.href
      });
      return true;
    } catch {
      return false;
    }
  } else {
    // Fallback - copy to clipboard
    await navigator.clipboard.writeText(text);
    return false;
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</div></div></div></div>