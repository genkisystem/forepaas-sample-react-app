import FpSdk from 'forepaas/sdk'
import FpXhr from 'forepaas/xhr'

/**
 * Connector for front api {@link FpXhr}
 * @access public
 * @example
 * configuration : {
 *   api:"http://myapi"
 * }
 */
class FpApi extends FpXhr {
  /**
   * Make request to the api. The baseUrl of the api
   * is taken from the config.api
   * @access public
   * @param {Object} options Options of the request
   * @example
   * api.request({url:'/qb/query', queryString:{}, params: {}, method:'POST'})
   * @return {Promise<Object, Error>} Promise with response or error from the api
   */
  request (options) {
    let Store = FpSdk.modules.store
    let debug = typeof FpSdk.config !== 'undefined' && FpSdk.config.debug === true
    let debugResult = {}
    options.baseURL = FpSdk.config.api
    if (debug) {
      options.queryString = options.queryString || {}
      options.queryString.cache = !debug
      if (Store && options.queryString.id) {
        debugResult[this.start] = Date.now()
      }
    }
    options.url = options.url
    return FpXhr.prototype.request(options)
      .then((res) => {
        if (Store && debug && options.queryString.id) {
          debugResult[this.end] = Date.now()
          debugResult['Time in milliseconds'] = debugResult[this.end] - debugResult[this.start]
          debugResult.config = options.data
          debugResult.results = res.data && res.data.results
          Store.dispatch(Store.actions.memory.set(`chart-debug-${options.queryString.id}`, debugResult))
        }
        return res.data
      })
  }

  get start () { return 'Timestamp: Start query' }
  get end () { return 'Timestamp: End query' }
}

export default new FpApi()
