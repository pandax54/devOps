import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Define output directory - change this to your desired path
const OUTPUT_DIR = path.join(__dirname, 'keys')

function generateAndSaveKeys() {
  console.log('Generating ES256 key pair for JWT authentication...')

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
      console.log(`Created directory: ${OUTPUT_DIR}`)
    }

    // Generate an ECDSA key pair using the P-256 curve (for ES256)
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    // Save the private key
    fs.writeFileSync(path.join(OUTPUT_DIR, 'private-key.pem'), privateKey)

    // Save the public key
    fs.writeFileSync(path.join(OUTPUT_DIR, 'public-key.pem'), publicKey)

    // Create environment variable format for easy copy-paste
    // This escapes newlines for direct use in .env files
    const privateKeyEnv = privateKey.replace(/\n/g, '\\n')
    const publicKeyEnv = publicKey.replace(/\n/g, '\\n')

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'jwt-keys.env'),
      `JWT_PRIVATE_KEY="${privateKeyEnv}"\nJWT_PUBLIC_KEY="${publicKeyEnv}"\n`
    )

    console.log('Keys generated successfully:')
    console.log(
      `- PEM keys: ${path.join(OUTPUT_DIR, 'public-key.pem')} and ${path.join(
        OUTPUT_DIR,
        'private-key.pem'
      )}`
    )
    console.log(`- Env format: ${path.join(OUTPUT_DIR, 'jwt-keys.env')}`)
    console.log('\nFor .env file, use the contents of jwt-keys.env')
    console.log(
      'For jose library with importPKCS8, use the private-key.pem file content'
    )
  } catch (error) {
    console.error('Error generating keys:', error)
    process.exit(1)
  }
}

// Run the function
generateAndSaveKeys()
