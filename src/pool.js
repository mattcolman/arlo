class Pool {

  constructor() {
    this.items = {}
    this.debug = false
  }

  destroy() {
    this.items = null
  }

  // add an item to the Pool
  add(key, item) {
    if (this.debug) console.log(`Add to Pool - ${key}`)
    this.items[key] = this.items[key] || []
    this.items[key].push(item)
    // @emit 'add'
    return this
  }

  // remove a sprite from the Pool and return the sprite for use in the game.
  remove(key = 'default', makeFn = null, makeParams = null, makeScope = null) {
    if (!this.contains(key)) {
      if (this.debug) console.log(`Remove from Pool - NEW - ${key}`)
      if (!makeFn) {
        return false
      }
      return makeFn.apply(makeScope, makeParams)
    }

    if (this.debug) console.log(`Remove from Pool - REUSE - ${key}`)
    let item = this.items[key].shift()
    if (typeof item.init === 'function') {
      item.init() // re-initialize the item
    } else {
      // console.warn("Pool: Item does not have an init function...but it could!")
    }
    // @emit 'remove'
    return item
  }

  // does the pool contain a sprite of this key?
  contains(key) {
    let arr
    return (arr = this.items[key]) ? arr.length > 0 : false
  }

}

export default Pool
