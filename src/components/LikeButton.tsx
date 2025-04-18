
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikes } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  targetUserId: string;
  currentUserId: string;
  className?: string;
}

export function LikeButton({ targetUserId, currentUserId, className }: LikeButtonProps) {
  const { likeCount, isLiked, isLoading, toggleLike } = useLikes(targetUserId, currentUserId);

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isLoading || isLiked}
      onClick={toggleLike}
      data-user-id={targetUserId}
      className={cn(
        "gap-2",
        isLiked && "cursor-not-allowed opacity-80",
        className
      )}
      title={isLiked ? "Already liked" : "Like profile"}
    >
      <Heart className={cn(
        "h-5 w-5",
        isLiked && "fill-current heart-liked"
      )} />
      <span>{likeCount}</span>
    </Button>
  );
}
