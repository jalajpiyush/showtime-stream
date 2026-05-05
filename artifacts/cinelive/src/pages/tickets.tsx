import { useListMyTickets } from "@workspace/api-client-react";
import { getListMyTicketsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { PlayCircle, Ticket as TicketIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Tickets() {
  const { data: tickets, isLoading } = useListMyTickets({
    query: { enabled: true, queryKey: getListMyTicketsQueryKey() }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-24">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
        <TicketIcon className="w-8 h-8 text-primary" />
        My Tickets
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tickets && tickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tickets.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <TicketIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No tickets yet</h3>
          <p className="text-muted-foreground mb-6">You haven't purchased any tickets. Discover amazing shows to watch!</p>
          <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Shows
          </Link>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, index }: { ticket: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border flex flex-col"
    >
      <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden">
        {ticket.show.thumbnailUrl ? (
          <img src={ticket.show.thumbnailUrl} alt={ticket.show.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <PlayCircle className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded px-2 py-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Access Granted</span>
        </div>

        <div className="absolute bottom-0 p-4 w-full">
          <h3 className="font-bold text-white text-lg mb-1 leading-tight">{ticket.show.title}</h3>
          <p className="text-xs text-gray-400 mb-4">Purchased: {format(new Date(ticket.purchasedAt), 'MMM d, yyyy')}</p>
        </div>
      </div>
      
      <div className="p-3 bg-zinc-900 border-t border-border mt-auto">
        <Link href={`/watch/${ticket.showId}`} className="flex items-center justify-center w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
          <PlayCircle className="w-4 h-4 mr-2" /> Watch Now
        </Link>
      </div>
    </motion.div>
  );
}