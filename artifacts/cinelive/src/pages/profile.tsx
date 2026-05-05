import { useState, useEffect, useRef } from "react";
import { useGetMyProfile, useUpdateMyProfile, useGetWatchHistory } from "@workspace/api-client-react";
import { getGetMyProfileQueryKey, getGetWatchHistoryQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Clock, Film, Save } from "lucide-react";
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
      onSuccess: () => toast.success("Profile updated successfully")
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
    updateProfile.mutate({
      data: { displayName }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 pb-24">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        My Profile
      </h1>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Account Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
                <div className="px-3 py-2 bg-muted/50 rounded-lg text-foreground border border-border text-sm">
                  {profile?.email || "Loading..."}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Display Name</label>
                <Input 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)} 
                  className="bg-input border-border"
                />
              </div>

              <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Continue Watching
            </h2>
            
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />)}
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <Link key={item.id} href={`/watch/${item.showId}`}>
                    <div className="flex gap-4 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                      <div className="w-24 aspect-video rounded bg-zinc-900 overflow-hidden shrink-0">
                        {item.show.thumbnailUrl ? (
                          <img src={item.show.thumbnailUrl} alt={item.show.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Film className="w-6 h-6 m-auto mt-4 text-zinc-700" />
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.show.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 mb-2">
                          Watched {formatDistanceToNow(new Date(item.watchedAt), { addSuffix: true })}
                        </p>
                        {item.show.duration && (
                          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
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
              <div className="text-center py-12 text-muted-foreground">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No watch history yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}