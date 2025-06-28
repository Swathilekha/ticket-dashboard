import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aodvyolehfrawijgfcbq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZHZ5b2xlaGZyYXdpamdmY2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjkyMzMsImV4cCI6MjA2NjI0NTIzM30.X7TcO75bApVvQhkuSEH2nPMtnyMO1V8ifWxWufaF31c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
