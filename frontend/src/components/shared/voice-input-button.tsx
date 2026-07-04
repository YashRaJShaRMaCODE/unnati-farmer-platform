"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { [index: number]: { transcript: string } };
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    SpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type LangCode = "hi-IN" | "en-IN";

export function VoiceInputButton({
  onTranscript,
  className,
  disabled,
}: {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState<LangCode>("hi-IN");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.webkitSpeechRecognition || window.SpeechRecognition
        : undefined;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscript(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    };
  }, [lang, onTranscript]);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    try {
      recognition.lang = lang;
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang, listening]);

  if (!supported) return null;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() =>
          setLang((prev) => (prev === "hi-IN" ? "en-IN" : "hi-IN"))
        }
        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 hover:bg-emerald-50"
        title="Toggle Hindi / English"
        disabled={disabled || listening}
      >
        {lang === "hi-IN" ? "HI" : "EN"}
      </button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "relative h-9 w-9 shrink-0 border-emerald-200",
          listening && "border-red-300 bg-red-50"
        )}
        onClick={toggle}
        disabled={disabled}
        title={listening ? "Stop listening" : "Voice input"}
      >
        {listening && (
          <span className="absolute inset-0 animate-ping rounded-md bg-red-400/30" />
        )}
        {listening ? (
          <MicOff className="relative h-4 w-4 text-red-600" />
        ) : (
          <Mic className="relative h-4 w-4 text-emerald-600" />
        )}
      </Button>
    </div>
  );
}
