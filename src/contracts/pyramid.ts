import { assert } from 'console'
import {
    PubKey,
    PubKeyHash,
    SmartContract,
    Utils,
    hash256,
    method,
    prop,
    hash160,
    MethodCallOptions,
    ContractTransaction,
    bsv,
    ByteString,
} from 'scrypt-ts'

// https://medium.com/coinmonks/smart-contract-based-pyramid-scheme-on-bitcoin-41fc3e0e46a1
export class Pyramid extends SmartContract {
    static readonly DUST: bigint = 1n

    @prop(true)
    schemer: PubKeyHash

    @prop()
    entryFee: bigint

    constructor(schemer: PubKeyHash, entryFee: bigint) {
        super(...arguments)
        this.schemer = schemer
        this.entryFee = entryFee
    }

    @method()
    public recruit(alicePubKey: PubKey, bobPubKey: PubKey) {
        const commissionOutput = Utils.buildPublicKeyHashOutput(
            this.schemer,
            2n * this.entryFee
        )

        this.schemer = hash160(alicePubKey)
        const aliceOutput = this.buildStateOutput(Pyramid.DUST)

        this.schemer = hash160(bobPubKey)
        const bobOutput = this.buildStateOutput(Pyramid.DUST)

        const outputs: ByteString =
            commissionOutput +
            aliceOutput +
            bobOutput +
            this.buildChangeOutput()
        assert(
            hash256(outputs) == this.ctx.hashOutputs,
            'hash outputs mismatch'
        )
    }

    static buildTxForRecruit(
        current: Pyramid,
        options: MethodCallOptions<Pyramid>,
        alicePubKey: PubKey,
        bobPubKey: PubKey
    ): Promise<ContractTransaction> {
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
            .addInput(current.buildContractInput(options.fromUTXO))
            .addOutput(
                new bsv.Transaction.Output({
                    script: bsv.Script.fromHex(
                        Utils.buildPublicKeyHashScript(current.schemer)
                    ),
                    satoshis: Number(2n * current.entryFee),
                })
            )

        const aliceInstance = current.next()
        aliceInstance.schemer = hash160(alicePubKey)

        const bobInstance = current.next()
        bobInstance.schemer = hash160(bobPubKey)

        unsignedTx
            .addOutput(
                new bsv.Transaction.Output({
                    script: aliceInstance.lockingScript,
                    satoshis: Number(Pyramid.DUST),
                })
            )
            .addOutput(
                new bsv.Transaction.Output({
                    script: bobInstance.lockingScript,
                    satoshis: Number(Pyramid.DUST),
                })
            )
            .change(options.changeAddress!)

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [
                {
                    instance: aliceInstance,
                    atOutputIndex: 1,
                    balance: Number(Pyramid.DUST),
                },
                {
                    instance: bobInstance,
                    atOutputIndex: 2,
                    balance: Number(Pyramid.DUST),
                },
            ],
        })
    }
}
