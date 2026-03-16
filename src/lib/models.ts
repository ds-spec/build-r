import type { Provider } from "./keys";

export type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-opus-4-5"
  | "claude-sonnet-4-5"
  | "gemini-2.0-flash"
  | "gemini-1.5-pro"
  | "llama-3.3-70b-versatile";

export const MODELS: { id: ModelId; label: string; provider: Provider }[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
  { id: "claude-opus-4-5", label: "Claude Opus", provider: "anthropic" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet", provider: "anthropic" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "google" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "groq" },
];

export function modelToProvider(model: string): Provider {
  const entry = MODELS.find((m) => m.id === model);
  if (entry) return entry.provider;
  // Fallback by prefix
  if (model.startsWith("gpt-")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gemini-")) return "google";
  return "groq";
}

export const MODEL_LABELS: Record<string, string> = Object.fromEntries(
  MODELS.map((m) => [m.id, m.label])
);
