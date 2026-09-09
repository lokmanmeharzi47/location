const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://legnjqukzdwrpoaiyeiz.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function probe() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets, error);
}

probe();
