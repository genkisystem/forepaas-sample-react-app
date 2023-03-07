class Filter {
  constructor (filter) {
    Object.assign(this, filter)
  }
  toJSON () {
    var filter = {}
    for (let key in this) {
      if (this[key] && ((Array.isArray(this[key]) && this[key].length) || (this[key] instanceof Object && Object.keys(this[key]).length))) filter[key] = this[key]
    }
    return filter
  }
  merge (filter) {
    Object.assign(this, filter)
  }
}

export default Filter
