import { useEffect, useRef } from "react";

interface StreamState {
  audioElem: HTMLAudioElement | null;
  mediaSource: MediaSource | null;
  sourceBuffer: SourceBuffer | null;
  queue: Array<ArrayBuffer>;
}

export const handleAudio = (type: string) => {
  const streamRef = useRef<StreamState>({
    audioElem: null,
    mediaSource: null,
    sourceBuffer: null,
    queue: [],
  });

  useEffect(() => {
    const mediaSource = new MediaSource();
    streamRef.current.mediaSource = mediaSource;

    const audio: HTMLAudioElement | null = streamRef.current.audioElem;
    if (audio) {
      audio.src = URL.createObjectURL(mediaSource);
    }

    mediaSource.addEventListener("sourceopen", () => {
      const sb = mediaSource.addSourceBuffer(type);
      streamRef.current.sourceBuffer = sb;
      sb.addEventListener("updateend", () => {});
    });
  }, []);
};
