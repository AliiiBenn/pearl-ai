'use client';

import { ChevronDownIcon, LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  // REMOVED: SidebarMenu,
  // REMOVED: SidebarMenuButton,
  // REMOVED: SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { guestRegex } from '@/lib/constants';
import { createClient } from '@/utils/supabase/client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SupabaseUser {
  id: string;
  email?: string | null;
}

export function UserNav({ user }: { user: SupabaseUser }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const status = user ? 'authenticated' : 'unauthenticated';
  const data = user ? { user: user } : null;

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      toast({
        type: 'error',
        description: 'Failed to sign out!',
      });
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt="Profile image" />
            <AvatarFallback>{user.email?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {isGuest ? 'Guest' : user.email}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {isGuest ? 'Not logged in' : user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            data-testid="user-nav-item-theme"
            className="cursor-pointer"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {`Toggle ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          if (isGuest) {
            router.push('/login');
          } else {
            handleSignOut();
          }
        }}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>{isGuest ? 'Login to your account' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
