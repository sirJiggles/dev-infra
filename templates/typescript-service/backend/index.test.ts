import { hello } from './things'
console.log = jest.fn()

describe('some thing', () => {
  test('hello calls console', () => {
    hello()
    expect(console.log).toHaveBeenCalled()
  })
})
