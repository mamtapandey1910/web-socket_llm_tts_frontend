import { useEffect, useRef, useCallback } from "react";

export const useAudioStream = (mimeType: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const queueRef = useRef<Uint8Array[]>([]);

  const flushQueue = useCallback(() => {
    const sb = sourceBufferRef.current;
    const queue: any = queueRef.current;

    if (!sb || sb.updating || queue.length === 0) return;

    sb.appendBuffer(queue.shift()!);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    const audio = audioRef.current;
    audio.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = () => {
      const sb = mediaSource.addSourceBuffer(mimeType);
      sourceBufferRef.current = sb;
      sb.addEventListener("updateend", flushQueue);
    };

    mediaSource.addEventListener("sourceopen", onSourceOpen);

    return () => {
      mediaSource.removeEventListener("sourceopen", onSourceOpen);
      URL.revokeObjectURL(audio.src);
    };
  }, [mimeType, flushQueue]);

  const appendChunk = useCallback((chunk: Uint8Array<ArrayBufferLike>) => {
    const sb = sourceBufferRef.current;

    const uint8Chunk = new Uint8Array(chunk);

    if (!sb || sb.updating) {
      queueRef.current.push(uint8Chunk);
      return;
    }

    sb.appendBuffer(uint8Chunk);
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  return {
    audioRef,
    appendChunk,
    play,
    stop,
  };
};
