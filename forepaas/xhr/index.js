import axios from 'axios'
import cloneDeep from 'lodash/cloneDeep'

var cache = {}

/**
 * This is the class for the module xhr
 * This module allows to make request to the authentication
 * api or to your linked api
 * You can push interceptors to FpXhr.interceptors to handle each request, response, or errors
 * @example (new FpXhr().get({url:'/example'})).then(res => res).catch(err => err)
 */
class FpXhr {
  /**
   * Decode url that have querystring in it instead of having them in
   * the request options.queryString
   * @param {Object} options Options of the request
   * @return {Object} Querystring object
   */
  decodeQueryString (options) {
    options.queryString = options.queryString || {}
    var baseQS = {}
    if (options.baseURL) {
      var baseURL = options.baseURL.split('?')
      if (baseURL[1]) {
        baseQS = baseURL[1]
        baseQS = baseQS.split('&').reduce(function (prev, curr, i, arr) {
          var p = curr.split('=')
          prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1])
          return prev
        }, {})
      }
    }
    var qsInURL = options.url.split('?')[1]
    if (qsInURL) {
      qsInURL = qsInURL.split('&').reduce(function (prev, curr, i, arr) {
        var p = curr.split('=')
        prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1])
        return prev
      }, {})
    }
    let queryString = {}
    let key
    for (key in baseQS) { queryString[key] = baseQS[key] }
    for (key in qsInURL) { queryString[key] = qsInURL[key] }
    for (key in options.queryString) { queryString[key] = options.queryString[key] }
    return queryString
  }
  /**
   * Encode querystring object to querystring url
   * @param {Object} obj Querystring object
   * @return {String} Querystring url type
   */
  encodeQueryString (obj) {
    return Object.keys(obj).reduce(function (a, k) {
      if (obj[k] !== null && typeof obj[k] !== 'undefined') {
        a.push(k + '=' + encodeURIComponent(obj[k]))
      }
      return a
    }, []).join('&')
  }
  /**
   * Execute the request depending of options
   * @param {Object} options
   * @example FpXhr.request({baseUrl: '/example', method: 'GET', })
   * @return {Promise<Object|Error>} Result of the request
   */
  request (options) {
    options = options || {}
    options.queryString = this.decodeQueryString(options)
    if (options.baseURL) {
      options.baseURL = options.baseURL.split('?')[0]
    }
    var opts = cloneDeep(options)
    delete opts.id
    if (opts.data && opts.data.id) delete opts.data.id
    var cacheKey = JSON.stringify(opts)
    if (!options.cache || !cache[cacheKey]) {
      cache[cacheKey] = this.execute(options)
        .catch(err => {
        // Avoid storage of error
          cache[cacheKey] = null
          throw err
        })
    }
    return cache[cacheKey]
  }
  /**
   * Request interceptor, will be excuted before each request
   * @param {Object} options Options for the request
   */
  onRequest (options) {
    return FpXhr.interceptors
      .filter((interceptor) => {
        return interceptor.onRequest
      })
      .map((interceptor) => {
        return function () {
          return interceptor.onRequest(options)
        }
      })
      .reduce((p, f) => p.then(f), Promise.resolve())
  }
  /**
   * Response interceptor, will be excuted after each request
   * @param {Object} options Options for the request
   * @param {Object} response Response of the request
   */
  onResponse (options, response) {
    return FpXhr.interceptors
      .filter((interceptor) => {
        return interceptor.onResponse
      })
      .map((interceptor) => {
        return function () {
          return interceptor.onResponse(options, response)
        }
      })
      .reduce((p, f) => p.then(f), Promise.resolve())
  }
  /**
   * Error interceptor, will be excuted after
   * each request if an error occured
   * @param {Object} options Options for the request
   * @param {Error} error Error of the request
   */
  onError (options, error) {
    if (error.response && error.response.data &&
      error.response.data.message === 'Invalid token') {
      cache = {}
    }
    return FpXhr.interceptors
      .filter((interceptor) => {
        return interceptor.onError
      })
      .map((interceptor) => {
        return function () {
          return interceptor.onError(options, error)
        }
      })
      .reduce((p, f) => p.catch(f), Promise.reject(error))
  }
  /**
   * Execute the request
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  execute (options) {
    return this.onRequest(options)
      .then((options) => {
        options.url = options.url + '?' + this.encodeQueryString(options.queryString)
        return axios(options)
          .then((response) => {
            return this.onResponse(options, response)
          })
      })
      .catch((error) => {
        return this.onError(options, error)
      })
  }
  /**
   * GET method
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  get (options) {
    options.method = 'GET'
    return this.request(options)
  }
  /**
   * POST method
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  post (options) {
    options.method = 'POST'
    return this.request(options)
  }
  /**
   * PUT method
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  put (options) {
    options.method = 'PUT'
    return this.request(options)
  }
  /**
   * PATH method
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  path (options) {
    options.method = 'PATH'
    return this.request(options)
  }
  /**
   * DELETE method
   * @param {Object} options Request options
   * @see https://github.com/axios/axios
   * @return {Promise<Object|Error>} Result of the request
   */
  delete (options) {
    options.method = 'DELETE'
    return this.request(options)
  }
}
FpXhr.interceptors = []

FpXhr.interceptors.push({
  onRequest: function (request) {
    return new Promise((resolve, reject) => {
      resolve(request)
    })
  },
  onResponse: function (options, response) {
    return new Promise((resolve, reject) => {
      resolve(response)
    })
  },
  onError: function (options, error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
})

export default FpXhr
