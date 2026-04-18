// Simple structured logger controlled by Vite env flag
const DEBUG_FLAG = (import.meta as any).env?.VITE_DEBUG_INVITES === 'true';

type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown> | string | number | boolean | null | undefined;

const formatPayload = (payloads: LogPayload[]) => {
  return payloads.map((p) => p).reduce((acc: Record<string, unknown>, cur, idx) => {
    acc[`arg${idx + 1}`] = cur as unknown as Record<string, unknown>;
    return acc;
  }, {});
};

export const logger = {
  enabled: DEBUG_FLAG,
  log: (level: LogLevel, tag: string, ...payload: LogPayload[]) => {
    if (!DEBUG_FLAG) return;
    const now = new Date().toISOString();
    const data = { timestamp: now, level, tag, ...formatPayload(payload) };
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(`[${tag}]`, data);
      return;
    }
    if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(`[${tag}]`, data);
      return;
    }
    // eslint-disable-next-line no-console
    console.log(`[${tag}]`, data);
  },
  info: (tag: string, ...payload: LogPayload[]) => {
    logger.log('info', tag, ...payload);
  },
  warn: (tag: string, ...payload: LogPayload[]) => {
    logger.log('warn', tag, ...payload);
  },
  error: (tag: string, ...payload: LogPayload[]) => {
    logger.log('error', tag, ...payload);
  }
};

export const generateCorrelationId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  } catch {
    // ignore
  }
  // Fallback simple uuid v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


