// Run this code once to generate keys
import { generateKeyPair, exportJWK } from 'jose';
import fs from 'fs';

async function generateAndSaveKeys() {
  // Generate a new key pair
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  
  // Export the keys
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  
  // Save to files
  fs.writeFileSync('public-key.json', JSON.stringify(publicJwk, null, 2));
  fs.writeFileSync('private-key.json', JSON.stringify(privateJwk, null, 2));
  
  console.log('Keys generated and saved');
}

generateAndSaveKeys();