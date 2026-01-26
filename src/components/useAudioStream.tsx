import { useRef } from "react";

export const useAudioStream = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<any[]>([]);

  const appendChunk = (chunk: ArrayBuffer) => {
    chunksRef.current.push(new Uint8Array(chunk));
    play(); // play automatically
  };

  const endStream = () => {
    const audioEl = audioRef.current;
    if (!audioEl || chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: "audio/mpeg" });
    chunksRef.current = [];
    const url = URL.createObjectURL(blob);
    audioEl.src = url;
    audioEl.play().catch((err) => console.warn("Audio play failed:", err));
  };

  const play = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (audioEl.paused) {
      audioEl.play().catch((err) => console.warn("Audio play failed:", err));
    }
  };

  // Clear previous chunks when sending new message
  const clearChunks = () => {
    chunksRef.current = [];
  };

  return { audioRef, appendChunk, endStream, play, clearChunks };
};
