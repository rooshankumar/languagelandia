import { supabase } from '@/lib/supabase';

export const getXP = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  return data?.xp || 0;
};

export const addXP = async (userId: string, points: number): Promise<void> => {
  const { data: user } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  const newXP = (user?.xp || 0) + points;

  await supabase
    .from('profiles')
    .update({ xp: newXP })
    .eq('id', userId);
};

export const getLevel = (xp: number): string => {
  if (xp > 1000) return 'Advanced';
  if (xp > 500) return 'Intermediate';
  return 'Beginner';
};

export const getProgress = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from('learning_activities')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('type', 'lesson_completed');

  const totalLessons = 20; // Total number of lessons
  return Math.min(100, Math.round(((count || 0) / totalLessons) * 100));
};