
-- Create custom types
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false', 'fill_blank', 'short_answer');
CREATE TYPE public.difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.powerup_type AS ENUM ('skip_question', 'double_stars', 'fifty_fifty');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  stars INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 10,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create questions table to store generated questions and prevent repeats
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- for multiple choice options
  correct_answer TEXT NOT NULL,
  difficulty difficulty DEFAULT 'medium',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz sessions to track user progress
CREATE TABLE public.quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic TEXT NOT NULL,
  current_question INTEGER DEFAULT 1,
  total_questions INTEGER DEFAULT 10,
  stars_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user answers table
CREATE TABLE public.user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions NOT NULL,
  question_id UUID REFERENCES questions NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  explanation TEXT,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store items table for powerups
CREATE TABLE public.store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  coin_cost INTEGER NOT NULL,
  powerup_type powerup_type NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user powerups table to track active boosts
CREATE TABLE public.user_powerups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  powerup_type powerup_type NOT NULL,
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard view
CREATE TABLE public.leaderboard (
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT,
  stars INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for questions
CREATE POLICY "Users can view their own questions" 
  ON public.questions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions" 
  ON public.questions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quiz sessions
CREATE POLICY "Users can view their own quiz sessions" 
  ON public.quiz_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions" 
  ON public.quiz_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" 
  ON public.quiz_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user answers
CREATE POLICY "Users can view their own answers" 
  ON public.user_answers FOR SELECT 
  USING (auth.uid() = (SELECT user_id FROM quiz_sessions WHERE id = session_id));

CREATE POLICY "Users can create their own answers" 
  ON public.user_answers FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT user_id FROM quiz_sessions WHERE id = session_id));

-- RLS Policies for store items (public read)
CREATE POLICY "Anyone can view store items" 
  ON public.store_items FOR SELECT 
  TO authenticated 
  USING (true);

-- RLS Policies for user powerups
CREATE POLICY "Users can view their own powerups" 
  ON public.user_powerups FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own powerups" 
  ON public.user_powerups FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own powerups" 
  ON public.user_powerups FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for leaderboard (public read for authenticated users)
CREATE POLICY "Authenticated users can view leaderboard" 
  ON public.leaderboard FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own leaderboard entry" 
  ON public.leaderboard FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entry" 
  ON public.leaderboard FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  
  INSERT INTO public.leaderboard (user_id, username, stars, xp)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 0, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some default store items
INSERT INTO public.store_items (name, description, coin_cost, powerup_type, duration_seconds) VALUES
('Skip Question', 'Skip the current question without penalty', 5, 'skip_question', 0),
('Double Stars', 'Earn 2x stars for the next 5 minutes', 15, 'double_stars', 300),
('50/50', 'Remove two wrong answers in multiple choice questions', 8, 'fifty_fifty', 0);
