import { useState } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import { useGetFeaturedShows, useListShows } from "@workspace/api-client-react";
import { getGetFeaturedShowsQueryKey, getListShowsQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Ticket, Clock, Globe, Film, Mic, Radio, ChevronRight, Flame, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "all" | "movie" | "concert" | "live_event";

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <Flame className="w-3.5 h-3.5" /> },
  { key: "movie", label: "Movies", icon: <Film className="w-3.5 h-3.5" /> },
  { key: "concert", label: "Concerts", icon: <Mic className="w-3.5 h-3.5" /> },
  { key: "live_event", label: "Live", icon: <Radio className="w-3.5 h-3.5" /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: featured } = useGetFeaturedShows({
    query: { enabled: true, queryKey: getGetFeaturedShowsQueryKey() }
  });

  const showTypeParam = activeTab === "all" ? "all" : activeTab;

  const { data: nowShowing, isLoading: loadingNow } = useListShows(
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

  return (
    <div className="w-full flex flex-col pb-24">
      {/* Hero Section — shown to everyone */}
      {featuredShow ? (
        <HeroSection show={featuredShow} />
      ) : (
        <LandingHero />
      )}

      {/* Sign-up CTA bar — only for signed-out users */}
      <Show when="signed-out">
        <div className="mx-4 md:mx-8 my-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-base">Unlock full access</p>
            <p className="text-muted-foreground text-sm">Sign in to buy tickets, stream online, and track your shows.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/sign-up" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">Get Started</Link>
            <Link href="/sign-in" className="bg-white/10 text-white border border-white/20 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap">Sign In</Link>
          </div>
        </div>
      </Show>

      {/* Category Tabs */}
      <div className="px-4 md:px-8 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="px-4 md:px-8 space-y-12"
        >
          {loadingNow ? (
            <SkeletonGrid />
          ) : (
            <>
              {activeTab === "all" && (
                <>
                  {nowShowingMovies.length > 0 && (
                    <Section title="Now Showing" subtitle="Movies in theatres & online" icon={<Film className="w-4 h-4 text-primary" />}>
                      <MovieGrid shows={nowShowingMovies} />
                    </Section>
                  )}
                  {nowShowingConcerts.length > 0 && (
                    <Section title="Concerts" subtitle="Live music experiences" icon={<Mic className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={nowShowingConcerts} />
                    </Section>
                  )}
                  {nowShowingLive.length > 0 && (
                    <Section title="Live Events" subtitle="Watch live, right now" icon={<Radio className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={nowShowingLive} />
                    </Section>
                  )}
                  {upcomingMovies.length > 0 && (
                    <Section title="Coming Soon" subtitle="Films releasing soon" icon={<Calendar className="w-4 h-4 text-primary" />}>
                      <MovieGrid shows={upcomingMovies} />
                    </Section>
                  )}
                  {(upcomingConcerts.length > 0 || upcomingLive.length > 0) && (
                    <Section title="Upcoming Events" subtitle="Book your spot early" icon={<Star className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={[...upcomingConcerts, ...upcomingLive]} />
                    </Section>
                  )}
                  {(nowShowing?.length ?? 0) === 0 && (upcoming?.length ?? 0) === 0 && (
                    <EmptyState label="No shows available right now." />
                  )}
                </>
              )}

              {activeTab === "movie" && (
                <>
                  {nowShowingMovies.length > 0 && (
                    <Section title="Now Showing" icon={<Film className="w-4 h-4 text-primary" />}>
                      <MovieGrid shows={nowShowingMovies} />
                    </Section>
                  )}
                  {upcomingMovies.length > 0 && (
                    <Section title="Coming Soon" icon={<Calendar className="w-4 h-4 text-primary" />}>
                      <MovieGrid shows={upcomingMovies} />
                    </Section>
                  )}
                  {nowShowingMovies.length === 0 && upcomingMovies.length === 0 && (
                    <EmptyState label="No movies available right now." />
                  )}
                </>
              )}

              {activeTab === "concert" && (
                <>
                  {nowShowingConcerts.length > 0 && (
                    <Section title="Now Playing" icon={<Mic className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={nowShowingConcerts} />
                    </Section>
                  )}
                  {upcomingConcerts.length > 0 && (
                    <Section title="Coming Soon" icon={<Calendar className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={upcomingConcerts} />
                    </Section>
                  )}
                  {nowShowingConcerts.length === 0 && upcomingConcerts.length === 0 && (
                    <EmptyState label="No concerts available right now." />
                  )}
                </>
              )}

              {activeTab === "live_event" && (
                <>
                  {nowShowingLive.length > 0 && (
                    <Section title="Live Now" icon={<Radio className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={nowShowingLive} />
                    </Section>
                  )}
                  {upcomingLive.length > 0 && (
                    <Section title="Coming Up" icon={<Calendar className="w-4 h-4 text-primary" />}>
                      <ShowGrid shows={upcomingLive} />
                    </Section>
                  )}
                  {nowShowingLive.length === 0 && upcomingLive.length === 0 && (
                    <EmptyState label="No live events right now." />
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LandingHero() {
  return (
    <div className="relative w-full h-[55vh] md:h-[65vh] flex items-center overflow-hidden mb-6">
      {/* Cinematic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c12] via-[#14161a] to-[#1a0808]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(220,38,38,0.18),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(220,38,38,0.08),transparent_60%)]" />
      {/* Film grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <div className="relative z-10 max-w-4xl px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-5 bg-primary/15 border border-primary/30 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide"
        >
          <Radio className="w-3 h-3" /> India's Hybrid Cinema + OTT Platform
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight"
        >
          Cinema. Concerts.<br />
          <span className="text-primary">Live.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-base md:text-lg text-gray-400 mb-8 max-w-xl"
        >
          Buy a ticket. Watch from anywhere. Feel every moment.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex gap-3 flex-wrap"
        >
          <Link href="/sign-up" className="bg-primary hover:bg-primary/90 text-white px-7 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary/25">
            Start Watching Free
          </Link>
          <Link href="/sign-in" className="bg-white/8 hover:bg-white/14 text-white border border-white/15 px-7 py-3 rounded-xl text-sm font-semibold transition-all">
            Sign In
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center gap-6 text-xs text-gray-500"
        >
          <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-primary/70" /> Movies</span>
          <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-primary/70" /> Concerts</span>
          <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-primary/70" /> Live Events</span>
        </motion.div>
      </div>
    </div>
  );
}

function HeroSection({ show }: { show: any }) {
  return (
    <section className="relative w-full h-[55vh] md:h-[72vh] mb-6 overflow-hidden">
      {show.thumbnailUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${show.thumbnailUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c12] via-[#14161a] to-[#1a0808]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 max-w-4xl">
        <div className="flex flex-wrap gap-2 mb-3">
          {show.isLive && (
            <span className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-primary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
            </span>
          )}
          <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/10">
            {show.showType === "movie" ? "Movie" : show.showType === "concert" ? "Concert" : "Live Event"}
          </span>
          {show.releaseType === "hybrid" && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Cinemas & Online
            </span>
          )}
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{show.title}</h2>
        {show.language && (
          <p className="text-gray-400 text-sm mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> {show.language}
            {show.duration && <> · <Clock className="w-3.5 h-3.5" /> {show.duration} min</>}
          </p>
        )}
        <p className="text-gray-300 text-sm md:text-base mb-5 line-clamp-2 max-w-2xl leading-relaxed">{show.description}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/shows/${show.id}`}>
            <Button size="lg" className="text-sm h-11 px-6 font-bold shadow-lg shadow-primary/20">
              <Ticket className="w-4 h-4 mr-2" />
              Book Ticket · ₹{show.price.toFixed(0)}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Section({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-20 bg-card/40 rounded-2xl border border-border/50">
      <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-12">
      <div>
        <div className="h-7 w-48 bg-card rounded-lg mb-5 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
      {shows.map((show, i) => (
        <ShowCard key={show.id} show={show} index={i} />
      ))}
    </div>
  );
}

function MovieCard({ show, index }: { show: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
    >
      <Link href={`/shows/${show.id}`}>
        <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
          {show.thumbnailUrl ? (
            <img
              src={show.thumbnailUrl}
              alt={show.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-10 h-10 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {show.isLive && (
              <span className="flex items-center gap-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
            {show.releaseType === "hybrid" && (
              <span className="bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Hybrid
              </span>
            )}
            {show.releaseType === "online_only" && (
              <span className="bg-blue-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Online
              </span>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 w-full p-3">
            <h4 className="text-xs font-bold text-white line-clamp-2 mb-1 leading-snug">{show.title}</h4>
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {show.language && (
                <span className="text-[9px] bg-white/12 text-white px-1.5 py-0.5 rounded font-medium">{show.language}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary font-black text-sm">₹{show.price.toFixed(0)}</span>
              {show.duration && <span className="text-[9px] text-gray-500">{show.duration}m</span>}
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
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
              <PlayCircle className="w-10 h-10 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            {show.isLive && (
              <span className="flex items-center gap-1 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-primary/25">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
            {show.genre && (
              <span className="bg-black/60 backdrop-blur-sm text-white border border-white/10 text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">{show.genre}</span>
            )}
          </div>

          <div className="absolute bottom-0 w-full p-3.5">
            <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{show.title}</h4>
            <div className="flex items-center justify-between">
              <span className="text-primary font-black text-sm">₹{show.price.toFixed(0)}</span>
              {show.startTime && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(show.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
