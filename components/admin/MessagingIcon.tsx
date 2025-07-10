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
      // Set up polling for real-time updates
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
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
      className="relative h-10 w-10 p-2 lg:h-9 lg:w-auto lg:px-3"
      disabled={isLoading}
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs lg:h-5 lg:w-5"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}