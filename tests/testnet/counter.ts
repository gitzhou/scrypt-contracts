import { Counter } from '../../src/contracts/counter'
import { getDefaultSigner } from '../utils/txHelper'
import { MethodCallOptions } from 'scrypt-ts'

async function main() {
    await Counter.compile()

    // create a genesis instance
    const initialCount = 0n
    const counter = new Counter(initialCount)

    // connect to a signer
    await counter.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await counter.deploy()
    console.log(
        `Counter deploy tx: ${deployTx.id}, count initial value: ${initialCount}`
    )

    let prevInstance = counter

    // multiple calls
    for (let i = 0; i < 3; i++) {
        // 1. build a new contract instance
        const nextInstance = prevInstance.next()
        // 2. apply the updates on the new instance.
        nextInstance.count++
        // 3. construct a transaction for contract call
        const { tx: callTx } = await prevInstance.methods.increment({
            next: {
                instance: nextInstance,
                balance: 1,
            },
        } as MethodCallOptions<Counter>)

        console.log(
            `Counter call tx: ${callTx.id}, count updated to: ${nextInstance.count}`
        )
        // prepare for the next iteration
        prevInstance = nextInstance
    }
}

describe('Test SmartContract `Counter` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
