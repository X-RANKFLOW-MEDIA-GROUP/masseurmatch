import fs from 'fs';

const schema = fs.readFileSync('supabase/PRODUCTION_SCHEMA_LOCK.sql','utf-8');

const required = ['profile_status','subscription_tier','visibility_status','stripe_customer_id'];

let fail = false;

required.forEach(c => {
  if(!schema.includes(c)){
    console.error('Missing:', c);
    fail = true;
  }
});

if(fail) process.exit(1);

console.log('DB OK');
