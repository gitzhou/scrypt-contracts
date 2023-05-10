import { HashPuzzle } from './src/contracts/hashPuzzle'
import {
    bsv,
    TestWallet,
    DefaultProvider,
    sha256,
    toByteString,
} from 'scrypt-ts'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({
        network: bsv.Networks.testnet,
    })
)

async function main() {
    await HashPuzzle.compile()

    const message = 'hello world'
    const instance = new HashPuzzle(sha256(toByteString(message, true)))

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const amount = 1
    const deployTx = await instance.deploy(amount)
    console.log(`HashPuzzle contract deployed: ${deployTx.id}`)
}

main()
