import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zilvxtwynzvidzdgijhl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbHZ4dHd5bnp2aWR6ZGdpamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzgwOTQsImV4cCI6MjA3NjIxNDA5NH0.O2W5uSLJF5ceFwW8Vz4uuKHgJHrzpr5FynOzGeayCRI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

