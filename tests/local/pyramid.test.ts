import { MethodCallOptions, PubKey, PubKeyHash, toHex } from 'scrypt-ts'
import { Pyramid } from '../../src/contracts/pyramid'
import {
    getDummySigner,
    getDummyUTXO,
    randomPrivateKey,
} from '../utils/txHelper'
import { myPublicKeyHash, myAddress } from '../utils/privateKey'
import { expect } from 'chai'

describe('Test SmartContract `Pyramid`', () => {
    it('should pass the public method unit test successfully.', async () => {
        await Pyramid.compile()

        const pyramid = new Pyramid(PubKeyHash(toHex(myPublicKeyHash)), 1000n)
        pyramid.bindTxBuilder('recruit', Pyramid.recruitTxBuilder)

        await pyramid.connect(getDummySigner())

        const [, alicePubKey, ,] = randomPrivateKey()
        const aliceInstance = pyramid.next()
        aliceInstance.schemer = PubKeyHash(toHex(alicePubKey))

        const [, bobPubKey, ,] = randomPrivateKey()
        const bobInstance = pyramid.next()
        bobInstance.schemer = PubKeyHash(toHex(bobPubKey))

        const { tx: callTx, atInputIndex } = await pyramid.methods.recruit(
            PubKey(toHex(alicePubKey)),
            PubKey(toHex(bobPubKey)),
            {
                fromUTXO: getDummyUTXO(),
                changeAddress: myAddress,
            } as MethodCallOptions<Pyramid>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })
})
