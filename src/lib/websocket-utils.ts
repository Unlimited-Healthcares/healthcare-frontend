import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';

type AuthPayload = { userId: string; token: string };

export const SOCKET_IO_PATH = '/socket.io/';

export const getSocketBaseUrl = (): string => {
  // Priority: VITE_SOCKET_BASE_URL > VITE_API_BASE > centralized API_BASE_URL (trim /api)
  const raw =
    (import.meta.env.VITE_SOCKET_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE as string | undefined) ||
    API_BASE_URL;

  // Using the updated config destination
  const DEFAULT = 'https://unlimitedhealthcares.com';
  if (!raw) return DEFAULT;

  const trimmed = raw.trim();

  // Handle relative paths (e.g., "/api")
  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const withoutApi = trimmed.replace(/\/?api\/?$/i, '');
      return `${origin}${withoutApi}`.replace(/\/$/, '');
    }
    return DEFAULT;
  }

  // Guard against bad values like "https" or "http"
  const withProtocol = /^(https?:)\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  // Remove trailing "/api"
  const withoutApi = withProtocol.replace(/\/?api\/?$/i, '');

  // Remove trailing slash
  const normalized = withoutApi.replace(/\/$/, '');
  return normalized;
};

export const shouldForceWebsocketOnly = (): boolean => {
  return String(import.meta.env.VITE_SOCKET_WS_ONLY || '').toLowerCase() === 'true';
};

export function buildNamespaceUrl(namespace: '/chat' | '/notifications' | '/video-conference'): string {
  const base = getSocketBaseUrl();
  return `${base}${namespace}`;
}

export function connectSocket(
  namespace: '/chat' | '/notifications' | '/video-conference',
  auth: AuthPayload,
  onEvent?: (event: string, data: unknown) => void
): Socket {
  const url = buildNamespaceUrl(namespace);
  const options: Parameters<typeof io>[1] = { path: SOCKET_IO_PATH };
  if (shouldForceWebsocketOnly()) {
    options.transports = ['websocket'];
  }

  const socket = io(url, options);

  socket.on('connect', () => {
    console.log(`✅ Connected to ${namespace} WebSocket`);
    socket.emit('authenticate', auth);
  });

  socket.on('authenticated', (data) => {
    console.log(`🔐 ${namespace} WebSocket authenticated:`, data);
  });

  socket.onAny((event, data) => {
    onEvent?.(event, data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Disconnected from ${namespace} WebSocket`);
  });

  socket.on('connect_error', (err) => {
    console.error(`❌ ${namespace} WebSocket connection error:`, err);
  });

  return socket;
}

export function createWebSocketHook(
  namespace: '/chat' | '/notifications' | '/video-conference',
  userId: string,
  token: string,
  onEvent?: (event: string, data: unknown) => void
) {
  return connectSocket(namespace, { userId, token }, onEvent);
}
