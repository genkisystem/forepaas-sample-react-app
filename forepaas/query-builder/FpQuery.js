import cloneDeep from 'lodash/cloneDeep'

import FpApi from 'forepaas/api'
import FpSdk from 'forepaas/sdk'
import Data from './FpQuery/Data'
import Scale from './FpQuery/Scale'
import Filter from './FpQuery/Filter'
import Evol from './FpQuery/Evol'
import Order from './FpQuery/Order'
import Total from './FpQuery/Total'
import QueryDictionary from './FpQueryDictionary'

class FpQuery {
  constructor (request) {
    this.cache = request.cache
    if (typeof (this.cache) === 'undefined') this.cache = true
    this.id = request.id
    this.dictionaries = (request.dictionaries || []).map(dict => new QueryDictionary(dict))
    this.data = new Data(request.data)
    this.scale = new Scale(request.scale)
    this.filter = new Filter(request.filter)
    this.evol = new Evol(request.evol)
    this.order = new Order(request.order)
    this.total = new Total(request.total)
    this.table_name = request.table_name
    this.database_name = request.database_name
    this.dynamic_parameters = []
    return this
  }

  addDynamicParameter (config, value) {
    let dynP = {
      type: config.type,
      transform: config.transform,
      value: value,
      params: config.params
    }
    Object.assign(dynP, config.meta)
    this.dynamic_parameters.push(dynP)
  }

  clone () {
    return cloneDeep(this)
  }

  merge (options) {
    options = options || {}
    this.data.merge(options.data || {})
    this.scale.merge(options.scale || {})
    this.filter.merge(options.filter || {})
    this.evol.merge(options.evol || {})
    this.order.merge(options.order || {})
    this.total.merge(options.total || {})
    this.dynamic_parameters = options.dynamic_parameters || this.dynamic_parameters
    this.table_name = options.table_name || this.table_name
    this.database_name = options.database_name || this.database_name
  }

  toJSON () {
    return {
      id: this.id,
      data: this.data,
      scale: this.scale,
      filter: this.filter,
      dynamic_parameters: this.dynamic_parameters,
      evol: Object.keys(this.evol).length ? this.evol : undefined,
      order: Object.keys(this.order).length ? this.order : undefined,
      total: Object.keys(this.total).length ? this.total : undefined,
      table_name: this.table_name,
      database_name: this.database_name,
      options: this.options || undefined
    }
  }

  static export (options) {
    return FpApi.post({
      url: '/qb/queries.' + options.output,
      responseType: 'blob',
      queryString: {
        formatter: 'table'
      },
      data: options.queries
    })
      .then((blob) => {
        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveBlob(blob, `${options.name || Object.keys(options.queries)[0]}.${options.output}`)
        } else {
          let url = window.URL.createObjectURL(blob)
          let a = document.createElement('a')
          document.body.appendChild(a)
          a.style = 'display: none'
          a.download = `${options.name || Object.keys(options.queries)[0]}.${options.output}`
          a.href = url
          a.click()
        }
        return true
      })
      .catch((err) => {
        return err
      })
  }

  compute (options, cache) {
    let request = this.clone()
    if (options) request.merge(options)
    if (typeof cache === 'undefined') { cache = this.cache }
    return FpApi.post({
      cache: cache,
      url: '/qb/query',
      data: request,
      queryString: {
        id: (FpSdk.config.debug === true) ? this.id : undefined
      }
    }).then((response) => {
      return Promise.all(this.dictionaries.map(dict => dict.compute(response)))
        .then(_ => {
          return response
        })
    })
  }
}

export default FpQuery
