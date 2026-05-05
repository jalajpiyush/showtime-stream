import { useState } from "react";
import { Link } from "wouter";
import { Show, useAuth } from "@clerk/react";
import { useGetFeaturedShows, useListShows } from "@workspace/api-client-react";
import { getGetFeaturedShowsQueryKey, getListShowsQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Ticket, Clock, Globe, Film, Mic, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "all" | "movie" | "concert" | "live_event";

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <PlayCircle className="w-4 h-4" /> },
  { key: "movie", label: "Movies", icon: <Film className="w-4 h-4" /> },
  { key: "concert", label: "Concerts", icon: <Mic className="w-4 h-4" /> },
  { key: "live_event", label: "Live", icon: <Radio className="w-4 h-4" /> },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col pb-20">
      <Show when="signed-out">
        <SignedOutHero />
      </Show>
      <Show when="signed-in">
        <SignedInContent />
      </Show>
    </div>
  );
}

function SignedOutHero() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
      <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6 bg-primary/20 border border-primary/40 text-primary px-4 py-1.5 rounded-full text-sm font-semibold"
        >
          <Radio className="w-3.5 h-3.5" /> India's #1 Hybrid Cinema + OTT Platform
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight"
        >
          Cinema. Concerts. <span className="text-primary">Live.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-lg md:text-xl text-gray-300 mb-8"
        >
          Buy a ticket. Watch from anywhere. Feel every moment.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Link href={`${basePath}/sign-up`} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-bold transition-colors">
            Start Watching
          </Link>
          <Link href={`${basePath}/sign-in`} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Sign In
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex items-center gap-8 text-sm text-gray-400"
        >
          <span className="flex items-center gap-1.5"><Film className="w-4 h-4 text-primary" /> Movies</span>
          <span className="flex items-center gap-1.5"><Mic className="w-4 h-4 text-primary" /> Concerts</span>
          <span className="flex items-center gap-1.5"><Radio className="w-4 h-4 text-primary" /> Live Events</span>
        </motion.div>
      </div>
    </div>
  );
}

function SignedInContent() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: featured } = useGetFeaturedShows({
    query: { enabled: true, queryKey: getGetFeaturedShowsQueryKey() }
  });

  const showTypeParam = activeTab === "all" ? "all" : activeTab;

  const { data: nowShowing } = useListShows(
    { category: "now_showing", showType: showTypeParam as any },
    { query: { enabled: true, queryKey: getListShowsQueryKey({ category: "now_showing", showType: showTypeParam as any }) } }
  );

  const { data: upcoming } = useListShows(
    { category: "upcoming", showType: showTypeParam as any },
    { query: { enabled: true, queryKey: getListShowsQueryKey({ category: "upcoming", showType: showTypeParam as any }) } }
  );

  const featuredShow = featured?.[0];

  const nowShowingMovies = nowShowing?.filter(s => s.showType === "movie") ?? [];
  const upcomingMovies = upcoming?.filter(s => s.showType === "movie") ?? [];
  const nowShowingConcerts = nowShowing?.filter(s => s.showType === "concert") ?? [];
  const upcomingConcerts = upcoming?.filter(s => s.showType === "concert") ?? [];
  const nowShowingLive = nowShowing?.filter(s => s.showType === "live_event") ?? [];
  const upcomingLive = upcoming?.filter(s => s.showType === "live_event") ?? [];

  const showAllNow = nowShowing ?? [];
  const showAllUpcoming = upcoming ?? [];

  return (
    <div className="w-full">
      {/* Featured Hero */}
      {featuredShow && (
        <section className="relative w-full h-[60vh] md:h-[75vh] mb-8">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredShow.thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col items-start max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {featuredShow.isLive && (
                <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-white/10">
                {featuredShow.showType === "movie" ? "🎬 Movie" : featuredShow.showType === "concert" ? "🎤 Concert" : "🔴 Live Event"}
              </span>
              {featuredShow.releaseType === "hybrid" && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  In Cinemas & Online
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">{featuredShow.title}</h2>
            {featuredShow.language && (
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> {featuredShow.language}
                {featuredShow.duration && <> · <Clock className="w-3.5 h-3.5" /> {featuredShow.duration} min</>}
              </p>
            )}
            <p className="text-gray-300 text-lg mb-6 line-clamp-2 max-w-2xl">{featuredShow.description}</p>
            <div className="flex items-center gap-4">
              <Link href={`/shows/${featuredShow.id}`}>
                <Button size="lg" className="text-base h-12 px-8 font-bold">
                  <Ticket className="w-5 h-5 mr-2" />
                  Book Ticket · ₹{featuredShow.price.toFixed(0)}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <div className="px-4 md:px-8 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="px-4 md:px-8 space-y-14"
        >
          {/* ALL tab */}
          {activeTab === "all" && (
            <>
              {nowShowingMovies.length > 0 && (
                <Section title="🎬 Now Showing Movies">
                  <MovieGrid shows={nowShowingMovies} />
                </Section>
              )}
              {nowShowingConcerts.length > 0 && (
                <Section title="🎤 Concerts">
                  <ShowGrid shows={nowShowingConcerts} />
                </Section>
              )}
              {nowShowingLive.length > 0 && (
                <Section title="🔴 Live Events">
                  <ShowGrid shows={nowShowingLive} />
                </Section>
              )}
              {upcomingMovies.length > 0 && (
                <Section title="Coming Soon · Movies">
                  <MovieGrid shows={upcomingMovies} />
                </Section>
              )}
              {(upcomingConcerts.length > 0 || upcomingLive.length > 0) && (
                <Section title="Coming Soon · Events">
                  <ShowGrid shows={[...upcomingConcerts, ...upcomingLive]} />
                </Section>
              )}
            </>
          )}

          {/* MOVIES tab */}
          {activeTab === "movie" && (
            <>
              {nowShowingMovies.length > 0 && (
                <Section title="🎬 Now Showing Movies">
                  <MovieGrid shows={nowShowingMovies} />
                </Section>
              )}
              {upcomingMovies.length > 0 && (
                <Section title="Coming Soon">
                  <MovieGrid shows={upcomingMovies} />
                </Section>
              )}
              {nowShowingMovies.length === 0 && upcomingMovies.length === 0 && (
                <EmptyState label="No movies available right now." />
              )}
            </>
          )}

          {/* CONCERTS tab */}
          {activeTab === "concert" && (
            <>
              {nowShowingConcerts.length > 0 && (
                <Section title="🎤 Now Playing">
                  <ShowGrid shows={nowShowingConcerts} />
                </Section>
              )}
              {upcomingConcerts.length > 0 && (
                <Section title="Coming Soon">
                  <ShowGrid shows={upcomingConcerts} />
                </Section>
              )}
              {nowShowingConcerts.length === 0 && upcomingConcerts.length === 0 && (
                <EmptyState label="No concerts available right now." />
              )}
            </>
          )}

          {/* LIVE tab */}
          {activeTab === "live_event" && (
            <>
              {nowShowingLive.length > 0 && (
                <Section title="🔴 Live Now">
                  <ShowGrid shows={nowShowingLive} />
                </Section>
              )}
              {upcomingLive.length > 0 && (
                <Section title="Coming Up">
                  <ShowGrid shows={upcomingLive} />
                </Section>
              )}
              {nowShowingLive.length === 0 && upcomingLive.length === 0 && (
                <EmptyState label="No live events right now." />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xl md:text-2xl font-bold mb-5 text-white border-l-4 border-primary pl-3">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-20 text-muted-foreground">{label}</div>
  );
}

function MovieGrid({ shows }: { shows: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
      {shows.map((show, i) => (
        <MovieCard key={show.id} show={show} index={i} />
      ))}
    </div>
  );
}

function ShowGrid({ shows }: { shows: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {shows.map((show, i) => (
        <ShowCard key={show.id} show={show} index={i} />
      ))}
    </div>
  );
}

function MovieCard({ show, index }: { show: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/10"
    >
      <Link href={`/shows/${show.id}`}>
        {/* Tall movie poster ratio */}
        <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
          {show.thumbnailUrl ? (
            <img
              src={show.thumbnailUrl}
              alt={show.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-12 h-12 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Badges top */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {show.isLive && (
              <span className="flex items-center gap-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
            {show.releaseType === "hybrid" && (
              <span className="bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Cinemas & Online
              </span>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 w-full p-3">
            <h4 className="text-sm font-bold text-white line-clamp-2 mb-1.5 leading-snug">{show.title}</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {show.language && (
                <span className="text-[10px] bg-white/15 text-white px-1.5 py-0.5 rounded font-medium">{show.language}</span>
              )}
              {show.duration && (
                <span className="text-[10px] text-gray-400">{show.duration} min</span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-primary font-bold text-sm">₹{show.price.toFixed(0)}</span>
              {show.genre && <span className="text-[10px] text-gray-500 uppercase tracking-wide">{show.genre}</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ShowCard({ show, index }: { show: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/10"
    >
      <Link href={`/shows/${show.id}`}>
        <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden">
          {show.thumbnailUrl ? (
            <img
              src={show.thumbnailUrl}
              alt={show.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {show.isLive && (
              <span className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
            {show.genre && (
              <span className="bg-black/60 backdrop-blur-sm text-white border border-white/10 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">{show.genre}</span>
            )}
          </div>

          <div className="absolute bottom-0 w-full p-4">
            <h4 className="text-base font-bold text-white line-clamp-1 mb-1">{show.title}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-primary font-bold">₹{show.price.toFixed(0)}</span>
              <span className="text-xs text-gray-400">{show.duration} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
