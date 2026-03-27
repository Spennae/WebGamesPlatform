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

export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<GameMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>(0);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

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
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [url]);

  const sendMessage = (message: Partial<GameMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { status, lastMessage, sendMessage };
}
