import { expect, use } from 'chai'
import { MethodCallOptions, sha256, toByteString } from 'scrypt-ts'
import { HashPuzzle } from '../../src/contracts/hashPuzzle'
import { getDummySigner, getDummyUTXO } from '../utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `HashPuzzle`', () => {
    let instance: HashPuzzle

    before(async () => {
        await HashPuzzle.compile()
        instance = new HashPuzzle(sha256(toByteString('hello world', true)))
        await instance.connect(getDummySigner())
    })

    it('should pass the public method unit test successfully.', async () => {
        const { tx: callTx, atInputIndex } = await instance.methods.unlock(
            toByteString('hello world', true),
            {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<HashPuzzle>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })

    it('should throw with wrong message.', async () => {
        return expect(
            instance.methods.unlock(toByteString('wrong message', true), {
                fromUTXO: getDummyUTXO(),
            } as MethodCallOptions<HashPuzzle>)
        ).to.be.rejectedWith(/Hash does not match/)
    })
})
