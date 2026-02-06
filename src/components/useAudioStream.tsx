import { useEffect, useRef } from "react";

export function useAudioStream(mimeType = "audio/mpeg") {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const queueRef = useRef<ArrayBuffer[]>([]);
  const endedRef = useRef(false);

  const initMediaSource = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", () => {
      if (sourceBufferRef.current) return;

      const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
      sourceBuffer.mode = "sequence";
      sourceBufferRef.current = sourceBuffer;

      sourceBuffer.addEventListener("updateend", () => {
        if (queueRef.current.length > 0 && !sourceBuffer.updating) {
          sourceBuffer.appendBuffer(queueRef.current.shift()!);
        }
      });
    });
  };

  useEffect(() => {
    initMediaSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appendChunk = (chunk: ArrayBuffer) => {
    if (endedRef.current) return;

    const mediaSource = mediaSourceRef.current;
    const sourceBuffer = sourceBufferRef.current;

    if (!mediaSource || !sourceBuffer) return;
    if (mediaSource.readyState !== "open") return;

    if (sourceBuffer.updating || queueRef.current.length > 0) {
      queueRef.current.push(chunk);
    } else {
      sourceBuffer.appendBuffer(chunk);
    }
  };

  const endStream = () => {
    if (endedRef.current) return;

    const mediaSource = mediaSourceRef.current;
    const sourceBuffer = sourceBufferRef.current;

    if (!mediaSource || !sourceBuffer) return;
    if (mediaSource.readyState !== "open") return;

    endedRef.current = true;

    if (sourceBuffer.updating) {
      sourceBuffer.addEventListener(
        "updateend",
        () => {
          try {
            mediaSource.endOfStream();
          } catch {}
        },
        { once: true },
      );
    } else {
      try {
        mediaSource.endOfStream();
      } catch {}
    }
  };

  const reset = () => {
    queueRef.current = [];
    endedRef.current = false;
    sourceBufferRef.current = null;
    mediaSourceRef.current = null;
    initMediaSource();
  };

  return {
    audioRef,
    appendChunk,
    endStream,
    reset,
  };
}
