import { useState } from "react";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try { // fallback for non-secure contexts / denied clipboard
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const onClick = async () => {
    setState((await copy(text)) ? "ok" : "fail");
    window.setTimeout(() => setState("idle"), 1800);
  };
  return (
    <button type="button" className="btn-ghost" onClick={onClick} aria-label={`Copy ${label}`}>
      {state === "ok" ? "Copied ✓" : state === "fail" ? "Copy failed – select manually" : `Copy ${label}`}
    </button>
  );
}
