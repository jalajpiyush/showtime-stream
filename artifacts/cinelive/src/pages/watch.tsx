import { useRoute, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useGetShow, useCheckTicketAccess, useRecordWatchHistory, useGetChatMessages, useSendChatMessage } from "@workspace/api-client-react";
import { getGetShowQueryKey, getCheckTicketAccessQueryKey, getGetChatMessagesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function Watch() {
  const [, params] = useRoute("/watch/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { data: show, isLoading: isShowLoading } = useGetShow(id, {
    query: { enabled: !!id, queryKey: getGetShowQueryKey(id) }
  });

  const { data: access, isLoading: isAccessLoading } = useCheckTicketAccess(
    { showId: id },
    { query: { enabled: !!id, queryKey: getCheckTicketAccessQueryKey({ showId: id }) } }
  );

  const recordProgress = useRecordWatchHistory();

  // Handle watch progress
  useEffect(() => {
    if (!videoRef.current || !access?.hasAccess) return;
    
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        recordProgress.mutate({
          data: { progressSeconds: Math.floor(videoRef.current.currentTime) }
        });
      }
    }, 30000); // 30s
    
    return () => clearInterval(interval);
  }, [access?.hasAccess, recordProgress]);

  if (isShowLoading || isAccessLoading) return <div className="h-screen bg-black" />;

  if (!access?.hasAccess) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-white mb-4">Ticket Required</h2>
        <p className="text-gray-400 mb-8 max-w-md">You need to purchase a ticket to watch this content.</p>
        <Button onClick={() => setLocation(`/shows/${id}`)}>Go to Show Details</Button>
      </div>
    );
  }

  const isLiveAndNotStarted = show?.isLive && show?.startTime && new Date(show.startTime) > new Date();

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col md:flex-row overflow-hidden relative z-50">
      {/* Video Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-4 z-50 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white font-medium">{show?.title}</h1>
          <div className="w-10" />
        </div>

        {isLiveAndNotStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900">
            <h3 className="text-primary font-bold uppercase tracking-widest mb-4">Live Event</h3>
            <p className="text-white text-xl">Starting soon...</p>
          </div>
        ) : (
          <video 
            ref={videoRef}
            src={show?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
            className="w-full h-full object-contain bg-black"
            controls
            autoPlay
            controlsList="nodownload"
          />
        )}
      </div>

      {/* Chat Sidebar */}
      {show?.isLive && (
        <div className="w-full md:w-80 h-1/3 md:h-full bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-zinc-900">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <h3 className="text-white font-medium">Live Chat</h3>
          </div>
          <ChatBox showId={id} />
        </div>
      )}
    </div>
  );
}

function ChatBox({ showId }: { showId: number }) {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  const { data: messages } = useGetChatMessages(
    { showId },
    { params: { limit: 50 } },
    { 
      query: { 
        enabled: !!showId, 
        queryKey: getGetChatMessagesQueryKey({ showId }, { limit: 50 }),
        refetchInterval: 5000 // Poll every 5s
      } 
    }
  );

  const sendMessage = useSendChatMessage({
    mutation: {
      onSuccess: () => {
        setMessage("");
        queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey({ showId }, { limit: 50 }) });
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({
      showId,
      data: { message: message.trim() }
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-bold text-gray-300 mr-2">{msg.displayName}</span>
            <span className="text-gray-100">{msg.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-zinc-900 border-t border-white/10 flex gap-2">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something..."
          className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 h-10"
        />
        <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={sendMessage.isPending || !message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}