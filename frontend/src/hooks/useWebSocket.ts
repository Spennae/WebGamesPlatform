import { useState, useEffect, useRef } from 'react';

export interface GameMessage {
  type: 'gameStart' | 'typing' | 'gameEnd' | 'finish';
  text?: string;
  progress?: number;
  errors?: number;
  timeLimit?: number;
  wpm?: number;
  accuracy?: number;
}

interface UseWebSocketReturn {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: GameMessage | null;
  sendMessage: (message: Partial<GameMessage>) => void;
}

export function useWebSocket(url: string, enabled: boolean = true): UseWebSocketReturn {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<GameMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as GameMessage;
        setLastMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, enabled]);

  const sendMessage = (message: Partial<GameMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { status, lastMessage, sendMessage };
}
