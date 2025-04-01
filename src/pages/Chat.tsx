
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ChatScreen } from '@/components/chat/ChatScreen';

const ChatPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);

  useEffect(() => {
    if (!user || !conversationId) return;

    const loadConversation = async () => {
      try {
        const { data: conversationParticipants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select(`
            users!user_id (
              id,
              email,
              profiles (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('conversation_id', conversationId);

        if (participantsError) throw participantsError;

        const otherParticipant = conversationParticipants
          ?.map(cp => cp.users)
          ?.find(u => u.id !== user.id);

        if (otherParticipant) {
          setConversation({
            id: conversationId,
            participant: {
              id: otherParticipant.id,
              email: otherParticipant.email,
              full_name: otherParticipant.profiles?.full_name || otherParticipant.email?.split('@')[0],
              avatar_url: otherParticipant.profiles?.avatar_url || '/placeholder.svg',
              avatar: otherParticipant.profiles?.avatar_url || '/placeholder.svg'
            }
          });
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [user, conversationId]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access chat</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return <ChatScreen conversation={conversation} />;
};

export default ChatPage;
