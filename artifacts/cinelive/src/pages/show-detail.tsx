import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useGetShow, useCheckTicketAccess, usePurchaseTicket } from "@workspace/api-client-react";
import { getGetShowQueryKey, getCheckTicketAccessQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlayCircle, Clock, Calendar, Film, CheckCircle2, Globe, Clapperboard, Building2, Tv } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ShowDetail() {
  const [, params] = useRoute("/shows/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<"online" | "theatre">("online");

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
        toast.success("Ticket booked successfully!");
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

  const openPayment = (mode: "online" | "theatre") => {
    setPurchaseMode(mode);
    setIsPaymentOpen(true);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!show) return <div className="p-8 text-center text-muted-foreground">Show not found</div>;

  const hasAccess = access?.hasAccess;
  const isHybrid = show.releaseType === "hybrid";
  const isTheatreOnly = show.releaseType === "theatre_only";
  const isMovie = show.showType === "movie";

  const typeLabel =
    show.showType === "movie" ? "🎬 Movie" :
    show.showType === "concert" ? "🎤 Concert" :
    "🔴 Live Event";

  const releaseLabel =
    isHybrid ? "Now in Cinemas & Online" :
    show.releaseType === "theatre_only" ? "In Cinemas Only" :
    "Premium Online Show";

  return (
    <div className="w-full pb-20">
      {/* Hero backdrop */}
      <div className="relative w-full h-[65vh] md:h-[75vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${show.thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 w-full p-6 md:p-12 md:pb-0 z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-end md:items-start">
            {/* Poster thumbnail (desktop only) */}
            <div className="w-44 md:w-60 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hidden md:block">
              {show.thumbnailUrl ? (
                <img src={show.thumbnailUrl} alt={show.title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-zinc-700" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {show.isLive && (
                  <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                  </span>
                )}
                <span className="bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">{typeLabel}</span>
                {isHybrid && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {releaseLabel}
                  </span>
                )}
                {!isHybrid && (
                  <span className="bg-white/5 text-gray-300 border border-white/10 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {releaseLabel}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{show.title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-5 text-gray-300 text-sm font-medium mb-5">
                {show.language && (
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> {show.language}</div>
                )}
                {show.duration && (
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {show.duration} min</div>
                )}
                {show.startTime && (
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {format(new Date(show.startTime), 'MMM d, yyyy · h:mm a')}</div>
                )}
                {show.genre && (
                  <div className="flex items-center gap-1.5"><Clapperboard className="w-4 h-4 text-primary" /> {show.genre}</div>
                )}
              </div>

              <p className="text-gray-300 text-lg mb-8 max-w-3xl leading-relaxed">{show.description}</p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {hasAccess ? (
                  <>
                    <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => setLocation(`/watch/${show.id}`)}>
                      <PlayCircle className="w-6 h-6 mr-2" />
                      Watch Online Now
                    </Button>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <CheckCircle2 className="w-5 h-5" /> Ticket Active
                    </div>
                  </>
                ) : isHybrid ? (
                  <>
                    <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => openPayment("online")}>
                      <Tv className="w-5 h-5 mr-2" />
                      Watch Online · ₹{show.price.toFixed(0)}
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-amber-500/50 text-amber-400 hover:bg-amber-500/10" onClick={() => openPayment("theatre")}>
                      <Building2 className="w-5 h-5 mr-2" />
                      Book Theatre · ₹{(show.price * 1.5).toFixed(0)}
                    </Button>
                  </>
                ) : isTheatreOnly ? (
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-amber-500/50 text-amber-400 hover:bg-amber-500/10" onClick={() => openPayment("theatre")}>
                    <Building2 className="w-5 h-5 mr-2" />
                    Book Theatre Ticket · ₹{show.price.toFixed(0)}
                  </Button>
                ) : (
                  <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => openPayment("online")}>
                    <Ticket className="w-6 h-6 mr-2" />
                    Buy Ticket · ₹{show.price.toFixed(0)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {purchaseMode === "theatre" ? "🎭 Book Theatre Ticket" : "🎬 Book Online Ticket"}
            </DialogTitle>
            <DialogDescription>
              {purchaseMode === "theatre"
                ? `Booking a theatre seat for ${show.title}.`
                : `Getting online streaming access for ${show.title}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="bg-muted/30 px-4 py-3 flex justify-between text-sm text-muted-foreground">
                <span>Show</span>
                <span>{show.title}</span>
              </div>
              {show.language && (
                <div className="bg-muted/20 px-4 py-3 flex justify-between text-sm text-muted-foreground border-t border-border">
                  <span>Language</span>
                  <span>{show.language}</span>
                </div>
              )}
              <div className="bg-muted/20 px-4 py-3 flex justify-between text-sm text-muted-foreground border-t border-border">
                <span>Type</span>
                <span>{purchaseMode === "theatre" ? "Theatre Seat" : "Online Stream"}</span>
              </div>
              <div className="px-4 py-4 flex justify-between items-center border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">
                  ₹{purchaseMode === "theatre" && isHybrid ? (show.price * 1.5).toFixed(0) : show.price.toFixed(0)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Powered by Razorpay (test mode) · No real charge will be made
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={purchaseMutation.isPending} className="font-bold">
              {purchaseMutation.isPending ? "Processing..." : "Pay with Razorpay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Ticket({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;
}
