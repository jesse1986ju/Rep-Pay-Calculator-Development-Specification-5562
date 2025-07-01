import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://azxbgnodeukavdrdyfrt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eGJnbm9kZXVrYXZkcmR5ZnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODcwNjEsImV4cCI6MjA2NjU2MzA2MX0.opl8adW4GD0-dsht2rwKk7KBtNbDWu_DGx6Cr4IJSQE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})