"use client";

import { useState } from "react";
import { processVoiceTranscriptAction, confirmVoiceLogAction } from "@/lib/actions/voice";
import { ParsedVoiceIntent } from "@/lib/voice/parser";

export function VoiceClient({
  recentVoiceLogs,
}: {
  recentVoiceLogs: {
    id: string;
    transcript: string;
    intent: string | null;
    confirmed: boolean;
    createdAt: Date | string;
  }[];
}) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    voiceLogId: string;
    transcript: string;
    parsed: ParsedVoiceIntent;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Web Speech API integration
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const win = window as unknown as Record<string, unknown>;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please type your phrase below.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRec as any)();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setFeedback(null);

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      handleProcessPhrase(speechResult);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback("Speech recognition error. Please try again or type manually.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleProcessPhrase = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await processVoiceTranscriptAction(textToProcess);
      if (res.ok) {
        setPendingDraft({
          voiceLogId: res.voiceLogId,
          transcript: res.transcript,
          parsed: res.parsed,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingDraft) return;
    setLoading(true);
    try {
      const res = await confirmVoiceLogAction(pendingDraft.voiceLogId);
      if (res.ok) {
        setFeedback("✓ Log successfully saved to your health record!");
        setPendingDraft(null);
        setTranscript("");
      } else {
        setFeedback(`Error: ${res.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {feedback}
        </div>
      )}

      {/* Voice Recorder Hero */}
      <div className="lif-card text-center py-8 space-y-4">
        <div className="flex justify-center">
          <button
            onClick={startSpeechRecognition}
            disabled={isListening || loading}
            className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
              isListening
                ? "bg-crisis text-white animate-pulse ring-8 ring-crisis/20"
                : "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20"
            }`}
          >
            <span className="text-3xl">{isListening ? "⏹️" : "🎙️"}</span>
          </button>
        </div>

        <div>
          <h3 className="font-bold text-ink">
            {isListening ? "Listening... Speak your log" : "Tap Microphone to Speak"}
          </h3>
          <p className="text-xs text-ink-muted mt-1">
            Try saying: &quot;Drank 2 glasses of water&quot;, &quot;BP is 120 over 80&quot;, or &quot;Slept 7.5 hours&quot;
          </p>
        </div>

        {/* Text fallback input */}
        <div className="max-w-md mx-auto pt-2 flex gap-2">
          <input
            type="text"
            placeholder="Or type here: e.g. walked 6000 steps"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleProcessPhrase(transcript);
            }}
            className="lif-input flex-1 text-xs"
          />
          <button
            onClick={() => handleProcessPhrase(transcript)}
            disabled={loading || !transcript.trim()}
            className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
          >
            {loading ? "Parsing..." : "Parse"}
          </button>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION MODAL / CARD */}
      {pendingDraft && (
        <div className="lif-card border-2 border-primary space-y-4 bg-primary-soft/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
              Review & Confirm Parsed Voice Log
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              Action Required
            </span>
          </div>

          <div className="space-y-2 bg-surface p-4 rounded-lg border border-line text-xs">
            <div className="text-ink-muted">
              Spoken Phrase: <span className="font-medium text-ink italic">&quot;{pendingDraft.transcript}&quot;</span>
            </div>
            <div className="text-ink-muted">
              Recognized Intent: <span className="font-bold text-primary-dark uppercase">{pendingDraft.parsed.intent}</span>
            </div>
            <div className="rounded bg-surface-subtle p-3 font-semibold text-ink text-sm">
              {pendingDraft.parsed.summary}
            </div>
          </div>

          <p className="text-[11px] text-ink-muted">
            🔒 <strong>Safety Invariant:</strong> Voice logging requires explicit confirmation. Nothing is written to your medical or health log without your approval.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="lif-btn-primary flex-1 py-2.5 text-xs font-bold"
            >
              {loading ? "Saving..." : "✓ Confirm & Log to Record"}
            </button>
            <button
              onClick={() => setPendingDraft(null)}
              className="lif-btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Voice Log History */}
      <div className="lif-card space-y-3">
        <h3 className="font-bold text-sm text-ink">Voice Logging History</h3>
        {recentVoiceLogs.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No voice entries logged yet.</p>
        ) : (
          <div className="divide-y divide-line/60">
            {recentVoiceLogs.map((vl) => (
              <div key={vl.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-ink">&quot;{vl.transcript}&quot;</p>
                  <p className="text-[11px] text-ink-muted capitalize">
                    Intent: {vl.intent ?? "general"} • {new Date(vl.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vl.confirmed ? "bg-emerald-100 text-emerald-800" : "bg-ink-muted/10 text-ink-muted"}`}>
                  {vl.confirmed ? "Confirmed" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
