import { Link } from "wouter";
import { Show, useAuth } from "@clerk/react";
import { useGetFeaturedShows, useListShows } from "@workspace/api-client-react";
import { getGetFeaturedShowsQueryKey, getListShowsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { PlayCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="relative w-full h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Your front-row seat to the world's best shows.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-300 mb-8"
        >
          Experience premium live events, exclusive premieres, and cinematic storytelling from anywhere.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href={`${basePath}/sign-up`} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Start Watching Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function SignedInContent() {
  const { data: featured } = useGetFeaturedShows({
    query: { enabled: true, queryKey: getGetFeaturedShowsQueryKey() }
  });
  
  const { data: nowShowing } = useListShows(
    { category: "now_showing" },
    { query: { enabled: true, queryKey: getListShowsQueryKey({ category: "now_showing" }) } }
  );

  const { data: upcoming } = useListShows(
    { category: "upcoming" },
    { query: { enabled: true, queryKey: getListShowsQueryKey({ category: "upcoming" }) } }
  );

  return (
    <div className="w-full">
      {featured && featured.length > 0 && (
        <section className="relative w-full h-[60vh] md:h-[80vh] mb-12">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${featured[0].thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070'})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col items-start max-w-4xl">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-4 uppercase tracking-wider">Featured</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{featured[0].title}</h2>
            <p className="text-gray-300 text-lg mb-8 line-clamp-3 max-w-2xl">{featured[0].description}</p>
            <div className="flex gap-4">
              <Link href={`/shows/${featured[0].id}`}>
                <Button size="lg" className="text-base h-12 px-8 font-semibold">
                  <Ticket className="w-5 h-5 mr-2" />
                  Get Tickets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="px-4 md:px-8 space-y-16">
        {nowShowing && nowShowing.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6 text-white border-l-4 border-primary pl-3">Now Showing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nowShowing.map((show, i) => (
                <ShowCard key={show.id} show={show} index={i} />
              ))}
            </div>
          </section>
        )}

        {upcoming && upcoming.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6 text-white border-l-4 border-primary pl-3">Coming Soon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {upcoming.map((show, i) => (
                <ShowCard key={show.id} show={show} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ShowCard({ show, index }: { show: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer"
    >
      <Link href={`/shows/${show.id}`}>
        <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden">
          {show.thumbnailUrl ? (
            <img src={show.thumbnailUrl} alt={show.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <PlayCircle className="w-12 h-12 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {show.isLive && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-primary/20">Live</span>}
            {show.genre && <span className="bg-black/60 backdrop-blur-sm text-white border border-white/10 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">{show.genre}</span>}
          </div>
          
          <div className="absolute bottom-0 w-full p-4">
            <h4 className="text-lg font-bold text-white line-clamp-1 mb-1">{show.title}</h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-primary font-bold">${show.price.toFixed(2)}</span>
              <span className="text-xs text-gray-400">{show.duration} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}