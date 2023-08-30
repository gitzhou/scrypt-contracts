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

        await instance.deploy()
    })

    it('should pass the public method unit test successfully.', async () => {
        const message = toByteString('hello world', true)
        const call = () => instance.methods.unlock(message)
        await expect(call()).not.to.be.rejected
    })

    it('should throw with wrong message.', async () => {
        const message = toByteString('wrong message', true)
        const call = () => instance.methods.unlock(message)
        await expect(call()).to.be.rejectedWith(/Hash does not match/)
    })
})
