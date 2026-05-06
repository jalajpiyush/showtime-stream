import { useState, useEffect, useRef } from "react";
import { useGetMyProfile, useUpdateMyProfile, useGetWatchHistory } from "@workspace/api-client-react";
import { getGetMyProfileQueryKey, getGetWatchHistoryQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Clock, Film, Save, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() }
  });

  const { data: history, isLoading: historyLoading } = useGetWatchHistory({
    query: { enabled: true, queryKey: getGetWatchHistoryQueryKey() }
  });

  const [displayName, setDisplayName] = useState("");
  const updateProfile = useUpdateMyProfile({
    mutation: {
      onSuccess: () => toast.success("Profile updated!")
    }
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      setDisplayName(profile.displayName || "");
      initialized.current = true;
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({ data: { displayName } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-black text-white">My Profile</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">Manage your account and view watch history.</p>

      <div className="grid md:grid-cols-[340px_1fr] gap-6">
        {/* Account card */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Avatar header */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
              <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-primary/15 border-2 border-border flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div className="pt-10 px-6 pb-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-bold text-white text-base leading-tight">
                    {profile?.displayName || profile?.email?.split("@")[0] || "—"}
                  </h2>
                  <p className="text-muted-foreground text-xs mt-0.5">{profile?.email}</p>
                </div>
                {profile?.isAdmin && (
                  <span className="flex items-center gap-1 bg-primary/15 text-primary border border-primary/25 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="bg-input border-border text-sm h-9"
                    placeholder="Your name"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="w-full h-9 text-sm font-bold"
                >
                  <Save className="w-3.5 h-3.5 mr-2" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Watched" value={history?.length ?? 0} />
            <StatCard label="In History" value={history?.length ?? 0} />
          </div>
        </div>

        {/* Watch history */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-white">Continue Watching</h2>
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <Link key={item.id} href={`/watch/${item.showId}`}>
                  <div className="flex gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-20 aspect-video rounded-lg bg-zinc-900 overflow-hidden shrink-0">
                      {item.show.thumbnailUrl ? (
                        <img src={item.show.thumbnailUrl} alt={item.show.title} className="w-full h-full object-cover group-hover:opacity-100 opacity-80 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-5 h-5 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-0.5 min-w-0">
                      <h4 className="font-bold text-white text-sm line-clamp-1 mb-0.5">{item.show.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDistanceToNow(new Date(item.watchedAt), { addSuffix: true })}
                      </p>
                      {item.show.duration && (
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (item.progressSeconds / (item.show.duration * 60)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                <Film className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-sm">No watch history yet.</p>
              <Link href="/" className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors mt-2 inline-block">
                Browse shows →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  );
}
