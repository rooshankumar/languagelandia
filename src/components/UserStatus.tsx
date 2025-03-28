
import { formatDistanceToNow } from 'date-fns';

interface UserStatusProps {
  isOnline?: boolean;
  lastSeen?: string | null;
}

export function UserStatus({ isOnline, lastSeen }: UserStatusProps) {
  if (isOnline) {
    return (
      <div className="flex items-center text-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <span className="text-green-600">Online</span>
      </div>
    );
  }

  if (lastSeen) {
    return (
      <div className="text-sm text-muted-foreground">
        Last seen {formatDistanceToNow(new Date(lastSeen))} ago
      </div>
    );
  }

  return null;
}
