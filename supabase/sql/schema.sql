
-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  native_language TEXT,
  learning_language TEXT,
  proficiency_level TEXT,
  learning_goal TEXT,
  date_of_birth DATE,
  gender TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  streak_count INTEGER DEFAULT 0,
  streak_last_date DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles Table (for public profile info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  bio TEXT,
  likes_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Onboarding Status Table
CREATE TABLE IF NOT EXISTS public.onboarding_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_complete BOOLEAN DEFAULT false,
  current_step TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- User Likes Table
CREATE TABLE IF NOT EXISTS public.user_likes (
  liker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  liked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (liker_id, liked_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  new_messages BOOLEAN DEFAULT true,
  profile_views BOOLEAN DEFAULT true,
  learning_reminders BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
