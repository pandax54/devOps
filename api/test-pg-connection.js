const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:password@localhost:5490/database'
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    
    await client.end();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();

// # Connect using connection string
// psql postgres://postgres:password@localhost:5490/database

// # OR connect with individual parameters
// psql -h localhost -p 5490 -U postgres -d database