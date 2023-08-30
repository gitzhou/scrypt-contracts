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

        await pyramid.deploy()

        const [, alicePubKey, ,] = randomPrivateKey()
        const [, bobPubKey, ,] = randomPrivateKey()

        const call = () =>
            pyramid.methods.recruit(
                PubKey(toHex(alicePubKey)),
                PubKey(toHex(bobPubKey)),
                {
                    changeAddress: myAddress,
                } as MethodCallOptions<Pyramid>
            )
        await expect(call()).not.to.be.rejected
    })
})
