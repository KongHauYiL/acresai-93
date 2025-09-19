
export interface Profile {
  id: string;
  username: string | null;
  stars: number;
  coins: number;
  xp: number;
  streak: number;
  last_active: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  stars: number;
  xp: number;
  last_updated: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  coin_cost: number;
  powerup_type: 'skip_question' | 'double_stars' | 'fifty_fifty';
  duration_seconds: number;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  topic: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  options?: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

export interface UserPowerup {
  id: string;
  user_id: string;
  powerup_type: 'skip_question' | 'double_stars' | 'fifty_fifty';
  quantity: number;
  expires_at: string | null;
  created_at: string;
}
