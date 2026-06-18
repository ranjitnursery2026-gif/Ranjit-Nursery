import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xecbakilbisemcrrdzve.supabase.co'
const supabaseAnonKey = 'sb_publishable_Ozgwg7RK4BDArZwEXgooAQ_9rccHXEf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
