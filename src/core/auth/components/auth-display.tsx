'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { AuthButtons } from './auth-buttons';
import UserMenu from './user-menu';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthDisplay() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (user) {
    return <UserMenu user={user} />;
  }

  return <AuthButtons />;
}