import { useEffect, useRef } from "react";

export const useWsConnection = (
  url: string,
  handlers: Record<string, any> = {},
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws: WebSocket = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = handlers.onOpen;
    ws.onmessage = handlers.onMessage;
    ws.onerror = handlers.onError;
    ws.onclose = handlers.onClose;

    // return () => ws.close();
  }, [url]);

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  };

  return { send, socket: wsRef };
};
