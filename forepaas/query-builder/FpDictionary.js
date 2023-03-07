import FpSdk from 'forepaas/sdk'
import FpDataset from './FpDataset'
import FpQuery from './FpQuery'
import FpTranslate from 'forepaas/translate'

class FpDictionary {
  constructor (options) {
    if (typeof options.id === 'object') {
      this.dictionary = {
        id: options.id.id,
        value: options.id.value
      }
      this.force = true
    }
    Object.assign(this, options)
    return this
  }

  generateRequest () {
    let request = {
      data: {
        fields: {}
      },
      scale: {
        fields: [this.dictionary.id]
      },
      id: this.dictionary.id + '-dictionary'
    }
    if (this.tableName) request.table_name = this.tableName
    if (this.filter) request.filter = this.filter
    request.data.fields[this.dictionary.id] = ['max']
    return request
  }

  generateTranslateRequest () {
    let request = {
      data: {
        fields: {}
      },
      scale: {
        fields: [this.dictionary.id]
      },
      filter: {},
      id: this.dictionary.id + '-translate'
    }
    request.filter[this.dictionary.id] = this.items.map(item => item.value)
    if (this.tableName) request.table_name = this.tableName
    if (this.translateTableName) request.table_name = this.translateTableName
    request.data.fields[this.dictionary.value] = ['max']
    return request
  }

  getLabels () {
    if (this.dictionary.id === this.dictionary.value) {
      return this.items
    }
    return new FpQuery(this.generateTranslateRequest()).compute()
      .then((data) => {
        let translate = {}
        data.results.forEach((res) => {
          translate[this.dictionary.id + '-' + res.scales[this.dictionary.id]] = res.data[this.dictionary.value].max[0].value
        })
        for (let key in FpSdk.config.i18n) {
          Object.assign(FpSdk.config.i18n[key], translate)
        }
        return this.items.map((item) => {
          item.label = FpTranslate(this.dictionary.id + '-' + item.value, { default: item.value })
          return item
        })
      })
  }

  getItems () {
    return new FpQuery(this.generateRequest()).compute()
      .then((data) => {
        this.items = data.results
          .map((item) => {
            return {
              label: item.scales[this.dictionary.id],
              value: item.scales[this.dictionary.id]
            }
          })
          .filter((item) => {
            return item.value && item.label
          })
        return this.getLabels()
      })
  }

  compute () {
    return FpDataset.compute()
      .then((dataset) => {
        if (!this.force) {
          this.dictionary = dataset.dictionnary[this.id] || {
            id: this.id,
            value: this.id
          }
        }
        return this.getItems()
      })
  }
}

export default FpDictionary
