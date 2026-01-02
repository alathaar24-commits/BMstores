import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbchtwizxhojdheykjrm.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY2h0d2l6eGhvamRoZXlranJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkxOTAsImV4cCI6MjA4MTYyNTE5MH0.S9PTlZ8V6oGIAnTUkeM7_gWrfQ9-p45-HrXpSMUEMYQ';

export const supabase = createClient(supabaseUrl, supabaseKey);