import { useRef, useState } from "react";
import { useWsConnection } from "./wsHandler";
import { useAudioStream } from "./useAudioStream";

export const TTSPlayer = () => {
  const [prompt, setPrompt] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const audio = useAudioStream("audio/mpeg");
  const unlockedRef = useRef(false);

  const { send } = useWsConnection("ws://localhost:8000", {
    onMessage: (event: MessageEvent) => {
      // 🔊 AUDIO CHUNK
      if (event.data instanceof ArrayBuffer) {
        audio.appendChunk(event.data);

        const audioEl = audio.audioRef.current;
        if (audioEl && audioEl.muted) {
          audioEl.muted = false;
        }
        return;
      }

      // 🧾 CONTROL MESSAGE
      const data = JSON.parse(event.data);

      if (data.type === "TTS_END") {
        audio.endStream();
        unlockedRef.current = false;
        setIsPlaying(false);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    },
  });

  const sendPrompt = () => {
    if (!prompt.trim() || isPlaying) return;

    const audioEl = audio.audioRef.current;
    if (!audioEl) return;

    // 🔁 RESET MEDIA SOURCE FOR NEW PROMPT
    audio.reset();

    // 🔓 AUTOPLAY UNLOCK (browser requirement)
    audioEl.muted = true;
    audioEl.play().catch(() => {});
    unlockedRef.current = true;

    setIsPlaying(true);

    send(
      JSON.stringify({
        messageId: Date.now().toString(),
        message: prompt,
      }),
    );

    setMessages((prev) => [...prev, `You: ${prompt}`]);
    setPrompt("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Streaming TTS</h2>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type prompt..."
      />

      <br />

      <button onClick={sendPrompt} disabled={isPlaying}>
        {isPlaying ? "Playing..." : "Send & Play"}
      </button>

      <br />
      <br />

      <audio ref={audio.audioRef} controls />

      <hr />

      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
};
