import { ChatConversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatLastSeen, formatMessageTime } from "@/utils/chatUtils";
import { getOtherParticipant } from "@/utils/chatUtils";

interface ConversationItemProps {
  conversation: ChatConversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  currentUserId,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const otherParticipant = getOtherParticipant(conversation, currentUserId);
  const hasUnread = (conversation.unreadCount || 0) > 0;
  const lastMessage = conversation.lastMessage;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex items-center p-4 gap-3 cursor-pointer hover:bg-accent/50 transition-colors",
        isActive && "bg-accent",
        hasUnread && !isActive && "bg-chat-unread/50"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
          <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
        </Avatar>
        <span className={cn(
          "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
          otherParticipant.isOnline ? "bg-green-500" : "bg-gray-400"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">{otherParticipant.name}</h3>
          {lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatMessageTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p
            className={cn(
              "text-sm truncate",
              hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {lastMessage.sender_id === currentUserId ? "You: " : ""}
            {lastMessage.content}
          </p>
        )}
      </div>
      {hasUnread && (
        <div className="h-2.5 w-2.5 rounded-full bg-chat-primary" />
      )}
    </div>
  );
};