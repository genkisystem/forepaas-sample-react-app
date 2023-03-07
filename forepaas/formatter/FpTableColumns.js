import FpMeasure from 'forepaas/formatter/FpMeasure'
import FpTranslate from 'forepaas/translate'
import FpDimension from 'forepaas/formatter/FpDimension'

import get from 'lodash/get'
import isEqual from 'lodash/isEqual'

class Column {
  constructor (options, formatter) {
    Object.assign(this, options)
    this._formatter = formatter
    this.width = this.width || 1
  }
  getWidth (nbCols) {
    let total = this._formatter.columns.map(col => col.width).reduce((a, b) => a + b, 0)
    return this.width / total
  }

  getHead () {
    throw new Error('ChartTable::Column::' + this.constructor.name + ':getHead:NotDefined')
  }

  getValue (row) {
    throw new Error('ChartTable::Column::' + this.constructor.name + ':getValue:NotDefined')
  }

  getI18n () {
    if (this.chart && this.chart.options) {
      return this.chart.options.i18n
    }
    return undefined
  }

  getString (row) {
    return this.getValue(row)
  }

  getCache (key, row) {
    return get(row, `_cache[${key}]`)
  }

  getClass (container) {
    let cls = 'fp-cell fp-cell-' + container
    if (this._formatter.sortOn === this) {
      cls += ' fp-cell-sort'
    }
    if (this.sortable) {
      cls += ' fp-cell-is-sortable'
    }
    return cls
  }

  setCache (key, row, value) {
    row._cache = row._cache || {}
    row._cache[key] = value
  }

  translate (key, options) {
    options = options || {}
    options.i18n = this._formatter.options.i18n
    return FpTranslate(key, options)
  }

  format (value) {
    if (this.formatFunc) {
      let func = /[^{]+(?=}[^}]*$)/.exec(this.formatFunc)
      if (func) {
        let result = new Function('value', `return ${func.toString()}`)(value)
        let content = this.formatFunc.replace(/[^{]+(?=}[^}]*$)/, result)
        return content.replace(/{|}/g, '')
      }
    }
    return value
  }
}

class ScaleColumn extends Column {
  constructor (options, formatter) {
    super(options, formatter)
    this.dimension = new FpDimension(this.scale)
  }

  getHead () {
    return this.translate(this.scale)
  }

  getValue (rows) {
    let cache = this.getCache('value_' + this.id, rows)
    if (typeof (cache) !== 'undefined') return cache
    if (!rows && rows.length) return 0
    let row = rows[0]
    if (!row) return ''
    let value = row.scales[this.scale]
    this.setCache('value_' + this.id, rows, this.translate(this.scale + '-' + value, { default: value, i18n: this.getI18n() }))
    return this.translate(this.scale + '-' + value, { default: value, i18n: this.getI18n() })
  }

  getString (rows) {
    let cache = this.getCache('string_' + this.id, rows)
    if (typeof (cache) !== 'undefined') return cache
    let value = (this.getValue(rows) || '').toString()
    value = this.dimension.formatFromScale(value).toString()
    this.setCache('string_' + this.id, rows, value)
    return this.translate(this.scale + '-' + value, { default: value, i18n: this.getI18n() })
  }
}

class DataColumn extends Column {
  getHead () {
    let cm = this.translate(this.computeMode)
    let data = this.translate(this.data)
    let head = cm
    if (head) head += ' '
    head += data
    if (this.evolutionScale) {
      let evol = this.translate('evol-' + this.evolutionScale + '-' + (this.evol || 0))
      if (head) head += ' '
      head += evol
    }

    if (this.scales) {
      for (let scale in this.scales) {
        if (head) head += ' '
        head += this.translate(scale + '-' + this.scales[scale], {default: this.scales[scale]})
      }
    }
    return head
  }

  getValue (rows) {
    let cache = this.getCache('value_' + this.id, rows)
    if (typeof (cache) !== 'undefined') return cache
    if (!rows && rows.length) return 0
    let row = rows.find(r => {
      return isEqual(this._formatter.getColIndex(r), this.scales)
    })
    if (!row) return 0
    let value = get(row, `data.${this.data}.${this.computeMode}[${this.evol || 0}].value`)
    this.setCache('value_' + this.id, rows, value)
    return value
  }

  getString (rows) {
    let cache = this.getCache('string_' + this.id, rows)
    if (typeof (cache) !== 'undefined') return cache
    if (this.getValue(rows) === null) return this.nullValue
    let value = (new FpDimension(this.data).isTemporal()) ? new FpDimension(this.data).formatFromScale(this.getValue(rows)) : new FpMeasure(this.data).setValue(this.getValue(rows)).toString()
    this.setCache('string_' + this.id, rows, this.format(value))
    return this.format(value)
  }
}

export { Column, ScaleColumn, DataColumn }
export default {
  Column, ScaleColumn, DataColumn
}
