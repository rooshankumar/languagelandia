
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { UserStatus } from '@/components/UserStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  conversation: {
    id: string;
    participant: {
      id: string;
      email: string;
      full_name: string;
      avatar_url: string;
      is_online?: boolean;
      last_seen?: string;
    };
  };
}

export const ChatHeader = ({ conversation }: Props) => {
  const navigate = useNavigate();
  const participant = conversation?.participant;

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report user:', participant?.id);
  };

  const handleBlock = () => {
    // TODO: Implement block functionality
    console.log('Block user:', participant?.id);
  };

  if (!participant) {
    return <div className="flex items-center p-4">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center ml-4">
          <Avatar>
            <AvatarImage src={participant.avatar_url || '/placeholder.svg'} />
            <AvatarFallback>
              {participant.full_name?.substring(0, 2).toUpperCase() || participant.email?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-semibold">
              {participant.full_name || 'Anonymous User'}
            </h2>
            <UserStatus isOnline={participant.is_online} lastSeen={participant.last_seen} />
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReport} className="text-destructive">
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBlock} className="text-destructive">
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
