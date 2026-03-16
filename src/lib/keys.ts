// Centralised key names — never type these strings inline elsewhere
export const KEY_NAMES = {
  openai:    'buildr_openai_key',
  anthropic: 'buildr_anthropic_key',
  google:    'buildr_google_key',
  groq:      'buildr_groq_key',
} as const

export type Provider = keyof typeof KEY_NAMES

export function getKey(provider: Provider): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY_NAMES[provider]) ?? ''
}

export function setKey(provider: Provider, value: string) {
  if (value.trim()) {
    localStorage.setItem(KEY_NAMES[provider], value.trim())
  } else {
    localStorage.removeItem(KEY_NAMES[provider])
  }
}

export function hasKey(provider: Provider): boolean {
  return getKey(provider).length > 0
}
