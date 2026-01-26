import { useState, useEffect } from "react";
import { useWsConnection } from "./wsHandler";
import { useAudioStream } from "./useAudioStream";
import "./TTSPlayer.css";

export const TTSPlayer = () => {
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const audio = useAudioStream();

  const { send } = useWsConnection("ws://localhost:8000", {
    onOpen: () => console.log("WS connected"),
    onMessage: (event: any) => {
      if (event.data instanceof ArrayBuffer) {
        // Append audio chunk
        audio.appendChunk(event.data);

        const audioEl = audio.audioRef.current;
        // Play only if it's not already playing
        if (audioEl && !isPlaying) {
          audio.play();
          setIsPlaying(true); // mark as playing
        }
        return;
      }

      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "TTS_END") {
          audio.endStream();
          setIsPlaying(false);
          return;
        }

        if (parsed.message) {
          setMessages((prev) => [...prev, parsed.message]);
        }
      } catch {
        setMessages((prev) => [...prev, event.data]);
      }
    },
  });

  const sendPrompt = () => {
    if (!prompt.trim() || isPlaying) return;

    // Clear old audio
    const audioEl = audio.audioRef.current;
    if (audioEl) {
      audioEl.pause();
      audioEl.src = "";
    }
    audio.clearChunks();
    setIsPlaying(false);

    send(
      JSON.stringify({
        messageId: Date.now().toString(),
        message: prompt,
      }),
    );

    setMessages((prev) => [...prev, `You: ${prompt}`]);
    setPrompt("");
  };

  useEffect(() => {
    const audioEl = audio.audioRef.current;
    if (!audioEl) return;

    const updateProgress = () => {
      if (audioEl.duration && !isNaN(audioEl.duration)) {
        setProgress((audioEl.currentTime / audioEl.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audioEl.addEventListener("timeupdate", updateProgress);
    audioEl.addEventListener("ended", onEnded);

    return () => {
      audioEl.removeEventListener("timeupdate", updateProgress);
      audioEl.removeEventListener("ended", onEnded);
    };
  }, [audio.audioRef]);

  return (
    <div className="audio-container">
      <h2>WebSocket TTS Player</h2>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your text here..."
      />

      <button onClick={sendPrompt} disabled={isPlaying}>
        {isPlaying ? "Playing..." : "Send & Play"}
      </button>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <audio ref={audio.audioRef} controls />

      <div className="message-log">
        <h4>Messages Log</h4>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};
