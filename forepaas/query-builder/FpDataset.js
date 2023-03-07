import FpApi from 'forepaas/api'

class FpDataset {
  constructor () {
    return this
  }
  compute () {
    return FpApi.get({
      cache: true,
      url: '/qb/dataset',
      data: this
    })
  }
}

export default new FpDataset()
