import { useState } from "react";

export const TTSPlayer = (): any => {
  const [prompt, setprompt] = useState("");
  //   const audio = useAudioStream

  return (
    <div>
      <textarea
        name="prompt"
        id="promptId"
        value={prompt}
        onChange={(e) => setprompt(e.target.value)}
      ></textarea>
    </div>
  );
};
