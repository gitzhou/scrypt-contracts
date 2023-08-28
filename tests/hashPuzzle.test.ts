import { expect, use } from 'chai'
import { sha256, toByteString } from 'scrypt-ts'
import { HashPuzzle } from '../src/contracts/hashPuzzle'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `HashPuzzle`', () => {
    let instance: HashPuzzle

    before(async () => {
        await HashPuzzle.compile()

        instance = new HashPuzzle(sha256(toByteString('hello world', true)))
        await instance.connect(getDefaultSigner())

        const deployTx = await instance.deploy()
        console.log(`HashPuzzle contract deployed: ${deployTx.id}`)
    })

    it('should pass the public method unit test successfully.', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.unlock(
            toByteString('hello world', true)
        )
        console.log(`HashPuzzle contract called: ${callTx.id}`)

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('should throw with wrong message.', async () => {
        return expect(
            instance.methods.unlock(toByteString('wrong message', true))
        ).to.be.rejectedWith(/Hash does not match/)
    })
})
