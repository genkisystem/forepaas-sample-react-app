import FpQuery from './FpQuery.js'
import QueryDictionary from './FpQueryDictionary'
import FpQueries from './FpQueries.js'
import FpDictionary from './FpDictionary.js'
import FpEndpoint from './FpEndpoint.js'
import FpResponse from './FpResponse.js'
import FpDataset from './FpDataset.js'
import FpQueryStore from './FpQueryStore.js'

class FpQueryBuilder {
  constructor () {
    this.FpQuery = FpQuery
    this.FpQueries = FpQueries
    this.FpQueryStore = FpQueryStore
    this.FpResponse = FpResponse
    this.FpEndpoint = FpEndpoint
    this.FpDictionary = FpDictionary
    this.FpDataset = FpDataset
    return this
  }
}

export { FpQueries, FpEndpoint, FpResponse, FpDictionary, FpDataset, FpQuery, QueryDictionary }
export default new FpQueryBuilder()
