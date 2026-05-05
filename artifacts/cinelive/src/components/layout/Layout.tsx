import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Show, useAuth } from "@clerk/react";
import { setTokenGetter } from "@/lib/authToken";
import { Film, Home, Ticket, User, Settings, LogOut, Clapperboard } from "lucide-react";
import { useClerk } from "@clerk/react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { getGetMyProfileQueryKey } from "@workspace/api-client-react";

export default function Layout({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-background text-foreground">
      <DesktopSidebar />
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

function DesktopSidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: profile } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() }
  });

  const isActive = (path: string) => location === path;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
      <div className="p-6 flex items-center gap-3">
        <Clapperboard className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold text-primary tracking-tight">CineLive</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
        
        <Show when="signed-in">
          <Link href="/tickets" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/tickets') ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
            <Ticket className="w-5 h-5" />
            <span className="font-medium">My Tickets</span>
          </Link>
          <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
          {profile?.isAdmin && (
            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
              <Settings className="w-5 h-5" />
              <span className="font-medium">Admin</span>
            </Link>
          )}
        </Show>
      </nav>

      <div className="p-4 border-t border-border">
        <Show when="signed-in">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in" className="flex items-center justify-center bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </Show>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const { data: profile } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() }
  });

  const isActive = (path: string) => location === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </Link>
      
      <Show when="signed-in">
        <Link href="/tickets" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/tickets') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Ticket className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Tickets</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
        {profile?.isAdmin && (
          <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Admin</span>
          </Link>
        )}
      </Show>
      <Show when="signed-out">
        <Link href="/sign-in" className={`flex flex-col items-center justify-center w-full h-full text-muted-foreground`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Sign In</span>
        </Link>
      </Show>
    </nav>
  );
}