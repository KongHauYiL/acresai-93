
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  stars INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  id as user_id,
  username,
  stars,
  xp,
  last_active as last_updated
FROM public.profiles
ORDER BY stars DESC, xp DESC;

-- Create store_items table
CREATE TABLE public.store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  coin_cost INTEGER NOT NULL,
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('skip_question', 'double_stars', 'fifty_fifty')),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create user_powerups table
CREATE TABLE public.user_powerups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('skip_question', 'double_stars', 'fifty_fifty')),
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'short_answer')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_powerups
CREATE POLICY "Users can view their own powerups" ON public.user_powerups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own powerups" ON public.user_powerups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own powerups" ON public.user_powerups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own powerups" ON public.user_powerups
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for questions
CREATE POLICY "Users can view all questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert questions" ON public.questions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow public read access to store_items
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view store items" ON public.store_items
  FOR SELECT TO authenticated USING (true);

-- Allow public read access to leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT TO authenticated USING (true);

-- Insert some default store items
INSERT INTO public.store_items (name, description, coin_cost, powerup_type, duration_seconds) VALUES
('Skip Question', 'Skip a difficult question and move to the next one', 5, 'skip_question', 0),
('Double Stars', 'Earn double stars for the next 5 minutes', 10, 'double_stars', 300),
('50/50 Help', 'Remove two wrong answers from multiple choice questions', 8, 'fifty_fifty', 0);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
