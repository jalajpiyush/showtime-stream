import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Show, useAuth } from "@clerk/react";
import { setTokenGetter } from "@/lib/authToken";
import { Film, Home, Ticket, User, Settings, LogOut, Clapperboard, Radio, Search } from "lucide-react";
import { useClerk } from "@clerk/react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { getGetMyProfileQueryKey } from "@workspace/api-client-react";

export default function Layout({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-background text-foreground">
      <DesktopSidebar />
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto min-w-0">
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
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Clapperboard className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight">
          Cine<span className="text-primary">Live</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <NavItem href="/" icon={<Home className="w-4 h-4" />} label="Home" active={isActive("/")} />

        <Show when="signed-in">
          <NavItem href="/tickets" icon={<Ticket className="w-4 h-4" />} label="My Tickets" active={isActive("/tickets")} />
          <NavItem href="/profile" icon={<User className="w-4 h-4" />} label="Profile" active={isActive("/profile")} />
          {profile?.isAdmin && (
            <NavItem href="/admin" icon={<Settings className="w-4 h-4" />} label="Admin" active={isActive("/admin")} />
          )}
        </Show>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Show when="signed-in">
          {profile && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-accent/40">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {profile.displayName || profile.email.split("@")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in" className="flex items-center justify-center bg-primary text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </Show>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-primary/15 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const { data: profile } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() }
  });

  const isActive = (path: string) => location === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around z-50">
      <MobileNavItem href="/" icon={<Home className="w-5 h-5" />} label="Home" active={isActive("/")} />
      <Show when="signed-in">
        <MobileNavItem href="/tickets" icon={<Ticket className="w-5 h-5" />} label="Tickets" active={isActive("/tickets")} />
        <MobileNavItem href="/profile" icon={<User className="w-5 h-5" />} label="Profile" active={isActive("/profile")} />
        {profile?.isAdmin && (
          <MobileNavItem href="/admin" icon={<Settings className="w-5 h-5" />} label="Admin" active={isActive("/admin")} />
        )}
      </Show>
      <Show when="signed-out">
        <MobileNavItem href="/sign-in" icon={<User className="w-5 h-5" />} label="Sign In" active={false} />
      </Show>
    </nav>
  );
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-wide">{label}</span>
    </Link>
  );
}
