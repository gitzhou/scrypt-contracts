import { MethodCallOptions, PubKey, PubKeyHash, toHex } from 'scrypt-ts'
import { Pyramid } from '../src/contracts/pyramid'
import { getDefaultSigner, randomPrivateKey } from './utils/txHelper'
import { myPublicKeyHash, myAddress } from './utils/privateKey'
import { expect } from 'chai'

describe('Test SmartContract `Pyramid`', () => {
    it('should pass the public method unit test successfully.', async () => {
        await Pyramid.compile()

        const pyramid = new Pyramid(PubKeyHash(toHex(myPublicKeyHash)), 1000n)
        await pyramid.connect(getDefaultSigner())

        const deployTx = await pyramid.deploy()
        console.log(`Pyramid contract deployed: ${deployTx.id}`)

        const [, alicePubKey, ,] = randomPrivateKey()
        const [, bobPubKey, ,] = randomPrivateKey()

        const { tx: callTx, atInputIndex } = await pyramid.methods.recruit(
            PubKey(toHex(alicePubKey)),
            PubKey(toHex(bobPubKey)),
            {
                changeAddress: myAddress,
            } as MethodCallOptions<Pyramid>
        )
        console.log(`Pyramid contract called: ${callTx.id}`)

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })
})
