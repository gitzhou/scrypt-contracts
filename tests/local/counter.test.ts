import { expect } from 'chai'
import { Counter } from '../../src/contracts/counter'
import { getDummySigner, getDummyUTXO } from '../utils/txHelper'
import { MethodCallOptions } from 'scrypt-ts'

describe('Test SmartContract `Counter`', () => {
    before(async () => {
        await Counter.compile()
    })

    it('should pass the public method unit test successfully.', async () => {
        // create a genesis instance
        const counter = new Counter(0n)
        // construct a transaction for deployment
        await counter.connect(getDummySigner())

        let prevInstance = counter

        // multiple calls
        for (let i = 0; i < 3; i++) {
            // 1. build a new contract instance
            const nextInstance = prevInstance.next()
            // 2. apply the updates on the new instance.
            nextInstance.count++
            // 3. construct a transaction for contract call
            const { tx: callTx, atInputIndex } =
                await prevInstance.methods.increment({
                    fromUTXO: getDummyUTXO(1),
                    next: {
                        instance: nextInstance,
                        balance: 1,
                    },
                } as MethodCallOptions<Counter>)

            // 4. run `verify` method on `prevInstance`
            const result = callTx.verifyScript(atInputIndex)

            expect(result.success, result.error).to.be.true

            // prepare for the next iteration
            prevInstance = nextInstance
        }
    })
})
