const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gmuaewnxfhzqltcjazhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWFld254Zmh6cWx0Y2phemhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzUwMTUsImV4cCI6MjA5MTExMTAxNX0.SavvLmtcrbquUjL_oCko5nF-xzVZwdJJ9Ak1JEl0VPM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
  { email: 'admin@mtb.com', password: 'admin123456', role: 'admin', full_name: 'Admin MTB' },
  { email: 'sales@mtb.com', password: 'sales123456', role: 'sales', full_name: 'Sales Staff' },
  { email: 'shipper@mtb.com', password: 'shipper123456', role: 'shipper', full_name: 'Shipper Staff' },
];

async function createUsers() {
  for (const user of users) {
    console.log(`Creating user: ${user.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          role: user.role,
          full_name: user.full_name
        }
      }
    });

    if (error) {
      console.log(`  ERROR: ${error.message}`);
    } else {
      console.log(`  SUCCESS: ${data.user?.id} (${user.role})`);
    }
  }
  console.log('\nDone! All users created.');
}

createUsers();
