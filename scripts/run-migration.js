const fetch = require('node-fetch');

async function runMigration() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  console.log('🚀 Executing migration via API...');
  console.log(`📍 Target URL: ${baseUrl}/api/admin/migrate`);

  try {
    // First check migration status
    console.log('📊 Checking migration status...');
    const statusResponse = await fetch(`${baseUrl}/api/admin/migrate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'admin-token'}`
      }
    });

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('📈 Migration status:', status);

      if (status.success && status.migrationStatus.hasModerationColumns) {
        console.log('✅ Migration already applied!');
        return;
      }
    }

    // Execute migration
    console.log('🔧 Executing migration...');
    const response = await fetch(`${baseUrl}/api/admin/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_API_KEY || 'admin-token'}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Migration failed: ${error.error}`);
    }

    const result = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Result:', result);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();