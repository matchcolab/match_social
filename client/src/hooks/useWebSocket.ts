import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  onlineCount: number;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(userId?: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(47); // Default count
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Authenticate if user is provided
        if (userId) {
          wsRef.current?.send(JSON.stringify({
            type: 'auth',
            userId,
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);

          // Handle specific message types
          switch (message.type) {
            case 'connected':
            case 'online_count_update':
              setOnlineCount(message.count || message.onlineCount || 47);
              break;
            case 'new_response':
              // Handle new response broadcast
              window.dispatchEvent(new CustomEvent('new-response', { detail: message.response }));
              break;
            case 'new_comment':
              // Handle new comment broadcast
              window.dispatchEvent(new CustomEvent('new-comment', { detail: message.comment }));
              break;
            case 'like_update':
              // Handle like update broadcast
              window.dispatchEvent(new CustomEvent('like-update', { detail: message }));
              break;
            case 'new_introduction_request':
              // Handle introduction request broadcast
              window.dispatchEvent(new CustomEvent('new-introduction', { detail: message.introduction }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      // Handle ping/pong for keepalive
      wsRef.current.addEventListener('ping', () => {
        wsRef.current?.send(JSON.stringify({ type: 'pong' }));
      });

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [userId]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Reconnect when user changes
  useEffect(() => {
    if (isConnected && userId) {
      sendMessage({
        type: 'auth',
        userId,
      });
    }
  }, [userId, isConnected, sendMessage]);

  return {
    isConnected,
    onlineCount,
    sendMessage,
    lastMessage,
  };
}
