export interface UserProfile {
  id: string;
  stars: number;
  starsToday: number;
  lastStarResetDate: string;
  tokens: number;
  lastTokenResetDate: string;
  totalQuestions: number;
  totalCorrect: number;
}

export interface GameSession {
  topic: string;
  questions: Question[];
  currentIndex: number;
  stats: {
    correct: number;
    stars: number;
  };
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const STORAGE_KEYS = {
  PROFILE: 'quiz_user_profile',
  SESSION: 'quiz_current_session',
};

const MAX_STARS_PER_DAY = 1500;
const DAILY_TOKEN_LIMIT = 3;

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (stored) {
    const profile = JSON.parse(stored);
    checkAndResetDailyLimits(profile);
    return profile;
  }
  
  const newProfile: UserProfile = {
    id: 'user_' + Date.now(),
    stars: 0,
    starsToday: 0,
    lastStarResetDate: new Date().toISOString(),
    tokens: DAILY_TOKEN_LIMIT,
    lastTokenResetDate: new Date().toISOString(),
    totalQuestions: 0,
    totalCorrect: 0,
  };
  
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
  return newProfile;
};

const checkAndResetDailyLimits = (profile: UserProfile) => {
  const now = new Date();
  const lastReset = new Date(profile.lastStarResetDate);
  const lastTokenReset = new Date(profile.lastTokenResetDate);
  
  // Check if it's a new day (UTC)
  const isNewDay = now.toDateString() !== lastReset.toDateString();
  const isNewTokenDay = now.toDateString() !== lastTokenReset.toDateString();
  
  if (isNewDay) {
    profile.starsToday = 0;
    profile.lastStarResetDate = now.toISOString();
  }
  
  if (isNewTokenDay) {
    profile.tokens = DAILY_TOKEN_LIMIT;
    profile.lastTokenResetDate = now.toISOString();
  }
  
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const updateProfile = (updates: Partial<UserProfile>) => {
  const profile = getProfile();
  const updated = { ...profile, ...updates };
  
  // Enforce daily star limit
  if (updates.stars && updates.stars > 0) {
    const starsToAdd = updates.stars - profile.stars;
    if (profile.starsToday + starsToAdd > MAX_STARS_PER_DAY) {
      const allowedStars = MAX_STARS_PER_DAY - profile.starsToday;
      updated.stars = profile.stars + allowedStars;
      updated.starsToday = MAX_STARS_PER_DAY;
    } else {
      updated.starsToday = profile.starsToday + starsToAdd;
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
};

export const canEarnStars = (): boolean => {
  const profile = getProfile();
  return profile.starsToday < MAX_STARS_PER_DAY;
};

export const getRemainingStars = (): number => {
  const profile = getProfile();
  return MAX_STARS_PER_DAY - profile.starsToday;
};

export const useToken = (): boolean => {
  const profile = getProfile();
  if (profile.tokens > 0) {
    updateProfile({ tokens: profile.tokens - 1 });
    return true;
  }
  return false;
};

export const getStarMilestone = (currentStars: number) => {
  const milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const nextMilestone = milestones.find(m => m > currentStars) || milestones[milestones.length - 1] + 50000;
  const progress = currentStars > 0 ? (currentStars / nextMilestone) * 100 : 0;
  
  return {
    next: nextMilestone,
    progress: Math.min(progress, 100)
  };
};

export const saveSession = (session: GameSession) => {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
};

export const getSession = (): GameSession | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};
