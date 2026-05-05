import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface MockTicket {
  id: string;
  showId: number;
  showTitle: string;
  showThumbnail: string | null;
  showType: string;
  releaseType: string;
  amountPaid: number;
  paymentRef: string;
  purchasedAt: string;
  startTime: string | null;
}

interface TicketsContextValue {
  tickets: MockTicket[];
  hasTicket: (showId: number) => boolean;
  purchaseTicket: (ticket: Omit<MockTicket, "id" | "paymentRef" | "purchasedAt">) => Promise<void>;
  loading: boolean;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

const STORAGE_KEY = "@cinelive/tickets";

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<MockTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTickets(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (updated: MockTicket[]) => {
    setTickets(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const purchaseTicket = useCallback(
    async (data: Omit<MockTicket, "id" | "paymentRef" | "purchasedAt">) => {
      const ticket: MockTicket = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
        paymentRef: "PAY_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
        purchasedAt: new Date().toISOString(),
      };
      const updated = [...tickets, ticket];
      await save(updated);
    },
    [tickets, save]
  );

  const hasTicket = useCallback(
    (showId: number) => tickets.some((t) => t.showId === showId),
    [tickets]
  );

  return (
    <TicketsContext.Provider value={{ tickets, hasTicket, purchaseTicket, loading }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used inside TicketsProvider");
  return ctx;
}
