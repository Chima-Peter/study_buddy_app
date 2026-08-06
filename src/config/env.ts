export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
