import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type EventHandler = (...args: unknown[]) => void;

export type IUseSocket = {
  url?: string;
  autoConnect?: boolean;
  listeners?: { [event: string]: EventHandler };
};

export const useSocket = (props: IUseSocket = {}) => {
  const { url = 'http://localhost:3000', autoConnect = true, listeners = {} } = props;

  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(url, {
      autoConnect,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      console.log('[socket] ✅ Connected:', socket.id);
    };

    const handleDisconnect = () => {
      setConnected(false);
      console.log('[socket] ❌ Disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Register custom listeners
    for (const [event, handler] of Object.entries(listeners)) {
      socket.on(event, handler);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);

      // Unregister custom listeners
      for (const [event, handler] of Object.entries(listeners)) {
        socket.off(event, handler);
      }

      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect, JSON.stringify(Object.keys(listeners))]);

  const emit = useCallback((event: string, ...args: unknown[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  return {
    connected,
    socket: socketRef.current,
    emit,
  };
};
