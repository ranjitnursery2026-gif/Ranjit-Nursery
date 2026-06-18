import { createClient } from '@supabase/supabase-js'

// TODO: Replace these with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://xecbakilbisemcrrdzve.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2Jha2lsYmlzZW1jcnJkenZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzU0NzUsImV4cCI6MjA5NzI1MTQ3NX0.Q9Mm6HaGp84nGzRymTsKMyNC86S8tyCQkiehj4cz0K0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
