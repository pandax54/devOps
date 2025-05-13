// generateNewKeys.ts
import crypto from 'crypto';
import fs from 'fs';

// Generate an ECDSA key pair using the P-256 curve (for ES256)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Output the keys
console.log('\nPrivate Key:');
console.log(privateKey);

console.log('\nPublic Key:');
console.log(publicKey);

// Save the keys
fs.writeFileSync('private-key.pem', privateKey);
fs.writeFileSync('public-key.pem', publicKey);

// Create .env format
const privateKeyEnv = privateKey.replace(/\n/g, '\\n');
const publicKeyEnv = publicKey.replace(/\n/g, '\\n');

console.log('\nFor .env file:');
console.log(`JWT_PRIVATE_KEY="${privateKeyEnv}"`);
console.log(`JWT_PUBLIC_KEY="${publicKeyEnv}"`);

// npx ts-node generateNewKeys.ts

// const privateKeyPem = `-----BEGIN PRIVATE KEY-----
// MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
// OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
// 1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
// -----END PRIVATE KEY-----`;