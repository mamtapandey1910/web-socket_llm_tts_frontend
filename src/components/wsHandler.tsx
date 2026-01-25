import { useEffect, useRef } from "react";

export const wsConnection = (
  url: string,
  handlers: Record<string, any> = {},
) => {
  const wsRef = useRef<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = handlers.onOpen;
    ws.onmessage = handlers.onMessage;
    ws.onerror = handlers.onError;
    ws.onclose = handlers.onClose;

    return () => ws.close();
  }, [url]);
};
