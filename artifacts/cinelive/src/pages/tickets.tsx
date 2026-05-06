import { useListMyTickets } from "@workspace/api-client-react";
import { getListMyTicketsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { PlayCircle, Ticket as TicketIcon, Film, Mic, Radio, CheckCircle2, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Tickets() {
  const { data: tickets, isLoading } = useListMyTickets({
    query: { enabled: true, queryKey: getListMyTicketsQueryKey() }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <TicketIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-black text-white">My Tickets</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">Your purchased shows and events.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets && tickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tickets.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card/40 rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TicketIcon className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No tickets yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Browse shows and purchase tickets to start watching.</p>
          <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
            Browse Shows
          </Link>
        </div>
      )}
    </div>
  );
}

function typeIcon(type: string) {
  if (type === "movie") return <Film className="w-3 h-3" />;
  if (type === "concert") return <Mic className="w-3 h-3" />;
  return <Radio className="w-3 h-3" />;
}

function TicketCard({ ticket, index }: { ticket: any, index: number }) {
  const canWatch = ticket.show.releaseType !== "theatre_only";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border flex flex-col hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/8"
    >
      <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden">
        {ticket.show.thumbnailUrl ? (
          <img src={ticket.show.thumbnailUrl} alt={ticket.show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <PlayCircle className="w-10 h-10 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Access badge */}
        <div className="absolute top-2.5 right-2.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-md px-2 py-1 flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          <span className="text-[9px] font-bold text-green-400 uppercase tracking-wide">Owned</span>
        </div>

        {/* Type badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1 flex items-center gap-1 text-[9px] font-semibold text-white uppercase tracking-wide">
            {typeIcon(ticket.show.showType)}
            {ticket.show.showType === "live_event" ? "Live" : ticket.show.showType}
          </span>
        </div>

        <div className="absolute bottom-0 p-3 w-full">
          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-1">{ticket.show.title}</h3>
          <p className="text-[10px] text-gray-400">
            {format(new Date(ticket.purchasedAt), "MMM d, yyyy")} · <span className="text-primary font-bold">₹{ticket.amountPaid.toFixed(0)}</span>
          </p>
        </div>
      </div>

      <div className="p-2.5 bg-zinc-950/60 border-t border-border">
        {canWatch ? (
          <Link href={`/watch/${ticket.showId}`} className="flex items-center justify-center w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs transition-colors gap-1.5">
            <PlayCircle className="w-3.5 h-3.5" /> Watch Now
          </Link>
        ) : (
          <div className="flex items-center justify-center w-full py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-semibold text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Theatre Only
          </div>
        )}
      </div>
    </motion.div>
  );
}
