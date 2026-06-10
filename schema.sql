-- Focus Supabase Database Schema

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    daily_screen_limit INTEGER DEFAULT 120, -- in minutes
    daily_offline_goal INTEGER DEFAULT 60, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. ACTIVITIES Table
CREATE TABLE IF NOT EXISTS public.activities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    points_per_minute INTEGER DEFAULT 1,
    icon_name TEXT DEFAULT 'Activity'
);

-- Enable RLS for Activities (public select, write for admin only)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to activities" ON public.activities
    FOR SELECT USING (true);

-- Insert Default Seeding Activities
INSERT INTO public.activities (name, points_per_minute, icon_name) VALUES
('Reading', 2, 'BookOpen'),
('Exercise & Gym', 3, 'Dumbbell'),
('Meditating', 3, 'Smile'),
('Walking & Hiking', 2, 'Footprints'),
('Gardening', 2, 'Flower'),
('Cooking & Baking', 1, 'Utensils'),
('Playing Music', 2, 'Music'),
('Socializing', 2, 'Users'),
('Crafts & Art', 2, 'Palette')
ON CONFLICT (name) DO UPDATE SET 
    points_per_minute = EXCLUDED.points_per_minute,
    icon_name = EXCLUDED.icon_name;

-- 3. DAILY LOGS Table
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_type TEXT CHECK (log_type IN ('screen', 'offline')) NOT NULL,
    activity_id INTEGER REFERENCES public.activities(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Daily Logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own daily logs" ON public.daily_logs
    FOR ALL USING (auth.uid() = user_id);

-- 4. USER STREAKS Table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_completed_date DATE
);

-- Enable RLS for Streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own streak" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak" ON public.user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. MOOD LOGS Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mood TEXT CHECK (mood IN ('Happy', 'Neutral', 'Stressed', 'Focused')) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Mood Logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own mood logs" ON public.mood_logs
    FOR ALL USING (auth.uid() = user_id);

-- 6. REMINDERS Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_time TEXT NOT NULL, -- Format 'HH:MM'
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Enable RLS for Reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own reminders" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);


-- AUTOMATED PROFILE CREATION TRIGGER ON SIGNUP
-- Creates a profile and initial user_streaks record automatically when auth.users is populated
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, daily_screen_limit, daily_offline_goal)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'display_name', new.email),
        120,
        60
    );

    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_completed_date)
    VALUES (new.id, 0, 0, NULL);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- UPDATE TIMESTAMP TRIGGER FOR PROFILES
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
