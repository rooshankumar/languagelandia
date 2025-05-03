import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🙏', '👏', '🔥', '✅'];

interface MessageReactionsProps {
  messageId: string;
  existingReactions?: Record<string, string[]>;
}

export const MessageReactions = ({ messageId, existingReactions = {} }: MessageReactionsProps) => {
  const [reactions, setReactions] = useState<Record<string, string[]>>(existingReactions);
  const [isLoading, setIsLoading] = useState(false);

  const handleReact = async (emoji: string) => {
    setIsLoading(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Update local state optimistically
      setReactions(prev => {
        const updatedReactions = { ...prev };

        if (!updatedReactions[emoji]) {
          updatedReactions[emoji] = [userId];
        } else if (!updatedReactions[emoji].includes(userId)) {
          updatedReactions[emoji] = [...updatedReactions[emoji], userId];
        } else {
          updatedReactions[emoji] = updatedReactions[emoji].filter(id => id !== userId);
          if (updatedReactions[emoji].length === 0) {
            delete updatedReactions[emoji];
          }
        }

        return updatedReactions;
      });

      // Update in database with proper primary key handling
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existingReaction) {
        // Delete the reaction if it exists
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId)
          .eq('emoji', emoji);
      } else {
        // Insert a new reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji: emoji,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1" data-message-reactions={messageId}>
      {Object.entries(reactions).map(([emoji, users]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-7 px-2 rounded-full bg-muted/30 hover:bg-muted/50"
          onClick={() => handleReact(emoji)}
          disabled={isLoading}
        >
          <span className="mr-1">{emoji}</span>
          <span className="text-xs">{users.length}</span>
        </Button>
      ))}

      {/* Removed the permanent smile icon - reactions now only available via long press */}
    </div>
  );
};