import { useRoute, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useGetShow, useCheckTicketAccess, useRecordWatchHistory, useGetChatMessages, useSendChatMessage } from "@workspace/api-client-react";
import { getGetShowQueryKey, getCheckTicketAccessQueryKey, getGetChatMessagesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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

  useEffect(() => {
    if (!videoRef.current || !access?.hasAccess) return;
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        recordProgress.mutate({
          data: { progressSeconds: Math.floor(videoRef.current.currentTime), showId } as any
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [access?.hasAccess]);

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

  const hasStartTime = !!show?.startTime;
  const isUpcoming = hasStartTime && new Date(show!.startTime!) > new Date();

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col md:flex-row overflow-hidden relative z-50">
      {/* Video Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-4 z-50 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            {show?.isLive && (
              <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
            <h1 className="text-white font-medium">{show?.title}</h1>
          </div>
          <div className="w-10" />
        </div>

        {isUpcoming ? (
          <Countdown targetTime={new Date(show!.startTime!)} title={show?.title ?? ""} />
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

      {/* Live Chat Sidebar */}
      {show?.isLive && (
        <div className="w-full md:w-80 h-64 md:h-full bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-zinc-900">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="text-white font-semibold">Live Chat</h3>
            <span className="ml-auto flex items-center gap-1 text-primary text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
            </span>
          </div>
          <ChatBox showId={id} />
        </div>
      )}
    </div>
  );
}

function Countdown({ targetTime, title }: { targetTime: Date; title: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetTime));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetTime)), 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-center px-4">
      <span className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm mb-6">
        <Clock className="w-4 h-4" /> Starting Soon
      </span>
      <h2 className="text-white text-3xl font-bold mb-8">{title}</h2>

      <div className="flex items-center gap-4 mb-8">
        {[
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Minutes" },
          { value: timeLeft.seconds, label: "Seconds" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="bg-zinc-900 border border-white/10 rounded-xl w-20 h-20 flex items-center justify-center">
              <span className="text-4xl font-black text-white tabular-nums">{String(value).padStart(2, "0")}</span>
            </div>
            <span className="text-gray-500 text-xs mt-2 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-sm max-w-xs">
        Your ticket is active. The stream will begin automatically when the show starts.
      </p>
    </div>
  );
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds };
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
        refetchInterval: 5000
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
    sendMessage.mutate({ showId, data: { message: message.trim() } });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-8">No messages yet. Say hi!</p>
        )}
        {messages?.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-primary mr-2">{msg.displayName}</span>
            <span className="text-gray-200">{msg.message}</span>
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
