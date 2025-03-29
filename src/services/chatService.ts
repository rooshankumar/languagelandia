import { supabase } from '@/lib/supabase';
import { Message, Conversation } from '@/types/chat';

// Placeholder useAuth hook - Needs a proper implementation
const useAuth = () => {
  const user = { id: 'user-id' };
  return { user };
};

export const createConversation = async (otherUserId: string) => {
  try {
    // Get current user ID
    const { user } = useAuth();
    if (!user) throw new Error('No user found');

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id, otherUserId])
      .single();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        participant_ids: [user.id, otherUserId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return newConversation;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};


export const sendMessage = async (
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string
): Promise<Message> => {
  const message = {
    conversation_id: conversationId,
    sender_id: senderId,
    recipient_id: recipientId,
    content,
    is_read: false
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('recipient_id', userId);

  if (error) throw error;
};

export const subscribeToMessages = (conversationId: string, callback: (message: Message) => void) => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

export const subscribeToConversations = (userId: string, callback: () => void) => {
  const channel = supabase
    .channel(`user_conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      () => callback()
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner (
        user_id,
        profiles (
          id,
          name,
          avatar_url,
          last_seen
        )
      ),
      messages (
        id,
        content,
        created_at,
        sender_id,
        recipient_id,
        is_read
      )
    `)
    .eq('conversation_participants.user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};