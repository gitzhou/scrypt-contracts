import { HashPuzzle } from '../../src/contracts/hashPuzzle'
import { getDefaultSigner } from '../utils/txHelper'
import { toByteString, sha256 } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await HashPuzzle.compile()
    const instance = new HashPuzzle(sha256(toByteString(message, true)))

    // connect to a signer
    await instance.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await instance.deploy()
    console.log(`HashPuzzle contract deployed: ${deployTx.id}`)

    // contract call
    const { tx: callTx } = await instance.methods.unlock(
        toByteString(message, true)
    )
    console.log(`HashPuzzle contract \`unlock\` called: ${callTx.id}`)
}

describe('Test SmartContract `HashPuzzle` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
