const fs = require('fs');
const path = require('path');
const { createClient } = require('./protected-api/node_modules/@supabase/supabase-js');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, 'protected-api', '.env'));

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  throw new Error('Missing SUPABASE_URL or a real SUPABASE_SERVICE_ROLE_KEY in protected-api/.env');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  { email: 'admin@mtb.com', password: 'admin123456', role: 'admin', full_name: 'Admin MTB' },
  { email: 'sales@mtb.com', password: 'sales123456', role: 'sales', full_name: 'Sales Staff' },
  { email: 'shipper@mtb.com', password: 'shipper123456', role: 'shipper', full_name: 'Shipper Staff' },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const usersOnPage = data?.users || [];
    const existingUser = usersOnPage.find((user) => user.email === email);
    if (existingUser) {
      return existingUser;
    }

    if (usersOnPage.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function upsertUser(user) {
  const existingUser = await findUserByEmail(user.email);
  let userId = existingUser?.id;

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.full_name,
      },
    });

    if (error) {
      throw error;
    }

    console.log(`  UPDATED: ${existingUser.id} (${user.role})`);
    userId = existingUser.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.full_name,
      },
    });

    if (error) {
      throw error;
    }

    userId = data.user?.id;
    console.log(`  CREATED: ${userId} (${user.role})`);
  }

  if (!userId) {
    throw new Error(`Missing user id after syncing ${user.email}`);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: user.full_name,
      role: user.role,
    });

  if (profileError) {
    throw profileError;
  }
}

async function createUsers() {
  for (const user of users) {
    console.log(`Syncing user: ${user.email}...`);
    await upsertUser(user);
  }

  console.log('\nDone! Auth users were synced with the Supabase Admin API.');
}

createUsers().catch((error) => {
  console.error(`\nFAILED: ${error.message}`);
  process.exitCode = 1;
});
