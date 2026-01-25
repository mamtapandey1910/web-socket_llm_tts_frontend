import { useState } from "react";
import { handleAudio } from "./handleAudio";

export const TTSPlayer = (): React.ReactElement => {
  const [prompt, setprompt] = useState("");
  const audio = handleAudio("audio/mpeg");

  return (
    <div>
      <textarea
        name="prompt"
        id="promptId"
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setprompt(e.target.value)
        }
      ></textarea>
    </div>
  );
};
