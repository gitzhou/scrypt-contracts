import { expect } from 'chai'
import { Counter } from '../src/contracts/counter'
import { MethodCallOptions } from 'scrypt-ts'
import { getDefaultSigner } from './utils/txHelper'

describe('Test SmartContract `Counter`', () => {
    let instance: Counter

    before(async () => {
        await Counter.compile()

        // create contract instance
        instance = new Counter(0n)
        await instance.connect(getDefaultSigner())

        // deploy the contract
        const deployTx = await instance.deploy()
        console.log(`Counter contract deployed: ${deployTx.id}`)
    })

    it('should pass the public method unit test successfully.', async () => {
        let prevInstance = instance
        // multiple calls
        for (let i = 0; i < 3; i++) {
            // 1. build a new contract instance
            const nextInstance = prevInstance.next()
            // 2. apply the updates on the new instance.
            nextInstance.count++
            // 3. construct a transaction for contract call
            const { tx: callTx, atInputIndex } =
                await prevInstance.methods.increment({
                    next: {
                        instance: nextInstance,
                        balance: 1,
                    },
                } as MethodCallOptions<Counter>)
            console.log(`Counter contract called: ${callTx.id}`)
            // 4. verify contract call result
            const result = callTx.verifyScript(atInputIndex)
            expect(result.success, result.error).to.be.true
            // 5. prepare for the next iteration
            prevInstance = nextInstance
        }
    })
})
