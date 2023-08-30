import { expect, use } from 'chai'
import { hash160, toByteString, bsv } from 'scrypt-ts'
import { P2SH } from '../src/contracts/p2sh'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
import { myPublicKey } from './utils/privateKey'
use(chaiAsPromised)

describe('Test SmartContract `P2SH`', () => {
    let instance: P2SH

    const asm = `1 ${myPublicKey.toHex()} 1 OP_CHECKMULTISIG`
    const redeemScript = toByteString(bsv.Script.fromASM(asm).toHex())
    const scriptHash = hash160(redeemScript)

    before(async () => {
        await P2SH.compile()

        instance = new P2SH(scriptHash)
        await instance.connect(getDefaultSigner())

        await instance.deploy()
    })

    it('should pass the public method unit test successfully.', async () => {
        const call = () => instance.methods.redeem(redeemScript)
        await expect(call()).not.to.be.rejected
    })
})
