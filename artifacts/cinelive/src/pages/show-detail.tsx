import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useGetShow, useCheckTicketAccess, usePurchaseTicket } from "@workspace/api-client-react";
import { getGetShowQueryKey, getCheckTicketAccessQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlayCircle, Clock, Calendar, Film, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ShowDetail() {
  const [, params] = useRoute("/shows/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { data: show, isLoading } = useGetShow(id, {
    query: { enabled: !!id, queryKey: getGetShowQueryKey(id) }
  });

  const { data: access } = useCheckTicketAccess(
    { showId: id },
    { query: { enabled: !!id, queryKey: getCheckTicketAccessQueryKey({ showId: id }) } }
  );

  const purchaseMutation = usePurchaseTicket({
    mutation: {
      onSuccess: () => {
        toast.success("Ticket purchased successfully!");
        queryClient.invalidateQueries({ queryKey: getCheckTicketAccessQueryKey({ showId: id }) });
        setIsPaymentOpen(false);
      }
    }
  });

  const handlePurchase = () => {
    purchaseMutation.mutate({
      data: {
        showId: id,
        paymentMethodToken: "mock_token_" + Date.now()
      }
    });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!show) return <div className="p-8 text-center text-muted-foreground">Show not found</div>;

  const hasAccess = access?.hasAccess;

  return (
    <div className="w-full pb-20">
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${show.thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80'})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 w-full p-6 md:p-12 md:pb-0 z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-end md:items-start">
            <div className="w-48 md:w-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 hidden md:block">
              {show.thumbnailUrl ? (
                <img src={show.thumbnailUrl} alt={show.title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-zinc-700" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {show.isLive && <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Live Event</span>}
                {show.genre && <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{show.genre}</span>}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{show.title}</h1>
              
              <div className="flex items-center gap-6 text-gray-300 text-sm font-medium mb-6">
                {show.duration && (
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {show.duration} min</div>
                )}
                {show.startTime && (
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {format(new Date(show.startTime), 'MMM d, yyyy • h:mm a')}</div>
                )}
              </div>
              
              <p className="text-gray-300 text-lg mb-8 max-w-3xl leading-relaxed">{show.description}</p>
              
              <div className="flex items-center gap-4">
                {hasAccess ? (
                  <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => setLocation(`/watch/${show.id}`)}>
                    <PlayCircle className="w-6 h-6 mr-2" />
                    Watch Now
                  </Button>
                ) : (
                  <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => setIsPaymentOpen(true)}>
                    Buy Ticket • ${show.price.toFixed(2)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              You are purchasing a ticket for {show.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border">
              <span className="font-medium text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${show.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This is a secure mock payment. No real charge will be made.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={purchaseMutation.isPending}>
              {purchaseMutation.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}