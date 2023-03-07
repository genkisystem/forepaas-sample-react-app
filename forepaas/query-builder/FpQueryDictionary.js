import FpDataset from './FpDataset'
import FpQuery from './FpQuery'
import FpSdk from 'forepaas/sdk'

class QueryDictionary {
  constructor (dictionaryId) {
    this.id = dictionaryId
  }

  // Call from FpQuery if the query have dictionaries argument
  compute (response) {
    let filter = {}
    // We get ids of the query, it will be use for filter
    // The query must have her dictionary in scale too
    filter[this.id] = response.results.map(result => result.scales[this.id]).filter(id => typeof(id)!=='undefined')
    // If no id, no need to do it, we bypass
    if (!filter[this.id].length) return Promise.resolve()
    return this.execute(filter)
      .then((response) => {
        for (let key in FpSdk.config.i18n) {
          Object.assign(FpSdk.config.i18n[key], response)
        }
      })
  }
  execute (filter) {
    let request = {
      data: {
        fields: {}
      },
      scale: {
        fields: [this.id]
      },
      filter: filter,
      id: this.id + '-translate'
    }
    return this.getDictionaryValue()
      .then((value) => {
        this.value = value
        request.data.fields[value] = ['max']
        return new FpQuery(request).compute()
      })
      .then(response => {
        let values = {}
        response.results.forEach((result) => {
          values[this.id + '-' + result.scales[this.id]] = result.data[this.value].max[0].value
        })
        return values
      })
  }

  getDictionaryValue () {
    return FpDataset.compute()
      .then((dataset) => {
        return (dataset.dictionnary[this.id] && dataset.dictionnary[this.id].value) || this.id
      })
  }
}

export default QueryDictionary
