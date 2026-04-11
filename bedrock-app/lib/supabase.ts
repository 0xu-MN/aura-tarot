import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || 'https://mhdshmkhiysgmlslfmlf.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_BACQUXa016EUM9-Pgn0EQQ_ik9nUo39';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
