import { expect, use } from 'chai'
import { hash160, toByteString, bsv, findSigs, toHex } from 'scrypt-ts'
import { P2SH } from '../src/contracts/p2sh'
import { getDefaultSigner, randomPrivateKey } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
import { myAddress, myPublicKey } from './utils/privateKey'
use(chaiAsPromised)

describe('Test SmartContract `P2SH`', () => {
    let instance: P2SH

    const [aPrivateKey, aPublicKey, , aAddress] = randomPrivateKey()
    const [bPrivateKey, bPublicKey, , bAddress] = randomPrivateKey()

    // 2 of 3 multisig
    const asm = `OP_2 ${myPublicKey.toHex()} ${aPublicKey.toHex()} ${bPublicKey.toHex()} OP_3 OP_CHECKMULTISIG`
    const redeemScript = toByteString(bsv.Script.fromASM(asm).toHex())
    const scriptHash = hash160(redeemScript)

    const signer = getDefaultSigner([aPrivateKey, bPrivateKey])

    before(async () => {
        await P2SH.compile()

        instance = new P2SH(scriptHash)
        await instance.connect(signer)

        await instance.deploy(100)
    })

    it('should pass the public method unit test successfully.', async () => {
        const { tx } = await instance.methods.redeem(redeemScript)
        console.log(tx.id)

        const redeemTx = new bsv.Transaction()
            .addInputFromPrevTx(tx, 0)
            .feePerKb(1)
            .change(myAddress)
        // sign with private keys of alice and bob
        const sigRequest = {
            prevTxId: tx.id,
            outputIndex: 0,
            inputIndex: 0,
            satoshis: tx.outputs[0].satoshis,
            scriptHex: tx.outputs[0].script.toHex(),
        }
        const sigResponses = await signer.getSignatures(redeemTx.toString(), [
            Object.assign({}, sigRequest, { address: aAddress }),
            Object.assign({}, sigRequest, { address: bAddress }),
        ])
        const sigs = findSigs(sigResponses, [aAddress, bAddress])
        const unlockingAsm = `OP_0 ${sigs.map((sig) => toHex(sig)).join(' ')}`
        redeemTx.setInputScript(0, bsv.Script.fromASM(unlockingAsm))
        console.log(await signer.provider?.sendTransaction(redeemTx))

        expect(redeemTx.verify()).to.be.true
    })
})
