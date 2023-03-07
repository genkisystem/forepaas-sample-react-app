import FpXhr from 'forepaas/xhr'

var memoryCache = {}
/**
 * Connector for front api {@link FpXhr}
 * @access public
 * @example
 * configuration : {
 *   api:"http://myapi"
 * }
 */
class FpArchitectApi extends FpXhr {
  constructor () {
    super()
    this.queryParams = null
  }
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
    if (!this.queryParams) this.queryParams = this._readArgs()
    let baseUrl = decodeURIComponent(this.queryParams.server.replace(/"|%22/g, ''))
    options.baseURL = baseUrl
    options.url = options.url
    options.queryString.token = this.queryParams.token || options.token || null
    return FpXhr.prototype.request(options)
      .then(res => {
        res.server = baseUrl
        res.token = this.queryParams.token || null
        return res
      })
  }

  config () {
    return this.request({
      method: 'GET',
      url: '/architect',
      queryString: {
        type: 'cam'
      }
    })
  }

  components (cache = true) {
    if (memoryCache.components && cache === true) return Promise.resolve(memoryCache.components)
    return this.request({
      method: 'GET',
      url: '/architect/components',
      queryString: {
        type: 'cam'
      }
    })
      .then(res => {
        memoryCache.components = res.data
        return res.data
      })
  }
  _readArgs () {
    let tmp, res
    if (document.location.href.length === 0) return {}
    tmp = document.location.href.split('?') ? document.location.href.split('?')[1] : ''
    if (!tmp) return {}
    res = {}
    tmp = tmp.split('&')
    tmp.forEach((t) => {
      t = t.split('=')
      if (t.length === 2) {
        res[t[0]] = t[1]
        try {
          res[t[0]] = JSON.parse(decodeURIComponent(res[t[0]]))
        } catch (err) {}
      }
    })
    return res
  }
}

export default new FpArchitectApi()
