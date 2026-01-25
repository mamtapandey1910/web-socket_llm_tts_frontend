import { useEffect, useRef } from "react";

export const handleAudio = (type: string) => {
  const audioRef = useRef(null);
  const mediaRef = useRef<MediaSource>(null);
  const bufferRef = useRef<any>(null);

  useEffect(() => {
    const media = new MediaSource();
    mediaRef.current = media;

    const audio: any = audioRef.current;
    audio.src = URL.createObjectURL(media);

    media.addEventListener("sourceopen", () => {
      bufferRef.current = media.addSourceBuffer(type);

      bufferRef.current.addEventListener("updateend");
    });
  }, []);
};
