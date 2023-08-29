import {
    assert,
    ByteString,
    method,
    prop,
    hash160,
    Ripemd160,
    SmartContract,
    Utils,
    hash256,
    MethodCallOptions,
    bsv,
} from 'scrypt-ts'

// https://medium.com/@xiaohuiliu/sun-rising-p2sh-7ebfca9283aa
export class P2SH extends SmartContract {
    @prop()
    redeemScriptHash: Ripemd160

    constructor(redeemScriptHash: Ripemd160) {
        super(...arguments)
        this.redeemScriptHash = redeemScriptHash
    }

    @method()
    public redeem(redeemScript: ByteString) {
        assert(
            hash160(redeemScript) == this.redeemScriptHash,
            'redeem script hash mismatch'
        )

        const amount = this.ctx.utxo.value
        const outputs =
            Utils.buildOutput(redeemScript, amount) + this.buildChangeOutput()
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    static async buildTxForRedeem(
        current: P2SH,
        options: MethodCallOptions<P2SH>,
        redeemScript: ByteString
    ) {
        const defaultAddress = await current.signer.getDefaultAddress()
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
            .addInput(current.buildContractInput(options.fromUTXO))
            .addOutput(
                new bsv.Transaction.Output({
                    script: bsv.Script.fromHex(redeemScript),
                    satoshis: current.utxo.satoshis,
                })
            )
            .change(options.changeAddress || defaultAddress)

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
        })
    }
}
