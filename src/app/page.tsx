import { redirect } from 'next/navigation'

// Temporary: redirect root to a hardcoded canvas ID.
// Week 2: this becomes the dashboard (canvas list) with real Supabase IDs.
export default function Home() {
  redirect('/canvas/default')
}
