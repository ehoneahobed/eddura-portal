"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface MessagingIconProps {
  onOpenMessaging: () => void;
}

export default function MessagingIcon({ onOpenMessaging }: MessagingIconProps) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();
    }
  }, [session?.user]);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/messages?isRead=false&limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onOpenMessaging}
      className="relative"
      disabled={isLoading}
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}