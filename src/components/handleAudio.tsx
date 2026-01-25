import { useEffect, useRef } from "react";

export const handleAudio = (type: string) => {
  const audiRef = useRef(null);
  const mediaRef = useRef<MediaSource>(null);

  useEffect(() => {
    const media = new MediaSource();
    mediaRef.current = media;
  }, []);
};
