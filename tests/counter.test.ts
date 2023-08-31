import { expect, use } from 'chai'
import { Counter } from '../src/contracts/counter'
import { MethodCallOptions } from 'scrypt-ts'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `Counter`', () => {
    let instance: Counter

    before(async () => {
        await Counter.compile()

        // create contract instance
        instance = new Counter(0n)
        await instance.connect(getDefaultSigner())

        // deploy the contract
        await instance.deploy()
    })

    it('should pass the public method unit test successfully.', async () => {
        let prevInstance = instance
        // multiple calls
        for (let i = 0; i < 3; i++) {
            // 1. build a new contract instance
            const nextInstance = prevInstance.next()
            // 2. apply the updates on the new instance.
            nextInstance.count++
            // 3. call contract and verify
            const call = async () =>
                prevInstance.methods.increment({
                    next: {
                        instance: nextInstance,
                        balance: 1,
                    },
                } as MethodCallOptions<Counter>)
            await expect(call()).not.to.be.rejected
            // 4. prepare for the next iteration
            prevInstance = nextInstance
        }
    })
})
