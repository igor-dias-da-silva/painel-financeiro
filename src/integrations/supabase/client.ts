import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ruubwpgemhyzsrbqspnj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWJ3cGdlbWh5enNyYnFzcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjkwNDUsImV4cCI6MjA3NTIwNTA0NX0.b9uxQ_iu-DmMZKrbsakWW9Y6trastDhObMHVWBq3udU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)