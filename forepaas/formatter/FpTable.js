import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import { ScaleColumn, DataColumn, Column } from './FpTableColumns'

class FpTable {
  constructor (chart) {
    Object.assign(this, chart)
    this.generateAxis()
    this.generateLines()
    this.generateColumns()
    this.initSortable()
  }

  getRows () {
    return this.rows.filter(row => !row.hide)
  }

  search (value) {
    this.searchValue = value
    this.rows = this.rows.map(row => {
      row.hide = !this.searchOnRow(row)
      return row
    })
  }

  // On recopie la configuration ou on génère une configuration par defaut pour les axes
  // A noter que par defaut les scales atterissent tous en y pour un tableau, une ligne affichée est alors égale a une ligne de résultat
  generateAxis () {
    this.axis = get(this.data.query_params, 'scale.axis') || {}
    this.axis.x = this.axis.x || []
    this.axis.y = this.axis.y || []
    let scales = get(this.data.query_params, 'scale.fields') || []
    scales = scales.filter(s => {
      return this.axis.x.indexOf(s) === -1 && this.axis.y.indexOf(s) === -1
    })
    this.axis.y = this.axis.y.concat(scales)
  }

  initSortable () {
    if (
      this.data.query_params.order &&
      Object.keys(this.data.query_params.order).length
    ) {
      let field = Object.keys(this.data.query_params.order)[0]
      this.reverse = this.data.query_params.order[field] === 'desc'
      this.sortOn = this.columns.find(col => field === col[col.type])
      if (this.sortOn) this.sort(this.sortOn, true)
    } else {
      this.reverse = false
      this.sortOn = this.columns.find(col => col.sortable)
    }
  }

  setScroll (start, end) {
    let sidx = Math.floor(start / this.options.rowHeight)
    let eidx = Math.ceil(end / this.options.rowHeight)
    let i = 0
    this.rows = this.rows.map(row => {
      if (row.hide) {
        row.display = false
      } else {
        row.display = i >= sidx && i <= eidx
        i++
      }
      return row
    })
  }

  sort (col, force) {
    if (!force && col === this.sortOn) {
      this.reverse = !this.reverse
    } else {
      this.sortOn = col
    }
    this.rows.sort((a, b) => {
      let aV = col.getValue(a)
      let bV = col.getValue(b)
      // redundant syntax seems necessary in order for the sorting to work
      if (aV === null) return -1
      if (bV === null) return 1
      if (typeof aV === 'string') aV = aV.toLowerCase()
      if (typeof bV === 'string') bV = bV.toLowerCase()
      if (aV < bV) return -1
      if (aV > bV) return 1
      return 0
    })
    if (this.reverse) this.rows.reverse()
  }

  getHeaderStyle (options) {
    return {
      height: this.options.headerHeight,
      paddingRight: (options && options.scrollWidth) || 0
    }
  }

  getHeaderRowStyle () {
    return {
      height: this.options.headerHeight
    }
  }

  getHeaderCellStyle (col) {
    return {
      width: col.getWidth() * 100 + '%',
      height: this.options.headerHeight,
      padding: this.options.padding,
      textAlign: col.align || 'left',
      lineHeight: this.options.headerHeight - this.options.padding + 'px'
    }
  }

  getBodyStyle () {
    return {
      top: this.options.headerHeight
    }
  }

  getBodyRowStyle () {
    return {
      height: this.options.rowHeight
    }
  }

  getBodyCellStyle (col) {
    return {
      width: col.getWidth() * 100 + '%',
      height: this.options.rowHeight,
      padding: this.options.padding,
      textAlign: col.align || 'left',
      lineHeight: this.options.rowHeight - this.options.padding + 'px'
    }
  }

  searchOnRow (row) {
    let regexp = new RegExp(this.searchValue, 'i')
    if (!row[0]) return false
    for (let c in this.columns) {
      let string = this.columns[c].getString(row)
      if (string.search(regexp) !== -1) return true
    }
    return false
  }

  // Permet de calculer l'index de ligne du résultat
  getRowIndex (result) {
    let key = {}
    this.axis.y.forEach(s => {
      key[s] = result.scales[s]
    })
    return key
  }

  generateLines () {
    this.rows = {}
    this.data.results.forEach(result => {
      let idx = JSON.stringify(this.getRowIndex(result))
      this.rows[idx] = this.rows[idx] || []
      this.rows[idx].push(result)
    })
    this.rows = Object.values(this.rows)
  }

  getEvolDepth () {
    let evolDepth = 0
    if (this.data.query_params.evol && this.data.query_params.evol.scale) {
      evolDepth = this.data.query_params.evol.depth || 1
    }
    return evolDepth
  }

  getColIndex (result) {
    let key = {}
    this.axis.x.forEach(s => {
      key[s] = result.scales[s]
    })
    return key
  }

  generateColumns () {
    let columns =
      (this.options.columns &&
        this.options.columns
          .filter(col => {
            if (typeof col === 'string') {
              let [colName, computeMode] = col.split('|')
              if (computeMode && colName) {
                return Object.keys(this.data.query_params.data.fields).includes(
                  colName
                )
              }
              return Object.keys(this.data.query_params.data.fields).includes(
                col
              )
            }
            if (col.type === 'data') {
              return Object.keys(this.data.query_params.data.fields).includes(
                col.data
              )
            }
            if (col.type === 'scale') {
              return this.data.query_params.scale.fields.includes(col.scale)
            }
          })
          .map(col => {
            let completeCol = {}
            if (typeof col === 'string') {
              let [colName, computeMode] = col.split('|')
              if (computeMode && colName) {
                completeCol = {
                  type: 'data',
                  data: colName,
                  computeMode: computeMode,
                  nullValue: this.options.nullValue || ''
                }
              } else {
                completeCol = {
                  type: 'data',
                  data: col,
                  computeMode: 'select',
                  nullValue: this.options.nullValue || ''
                }
              }
            } else {
              completeCol = Object.assign({}, col);
              completeCol.nullValue =
                completeCol.nullValue || this.options.nullValue || ''
            }
            return completeCol
          })) ||
      []
    // Generation des options si pas entrée a la main
    if (!this.options.columns) {
      // On ajoute une colonne par axe sur y, pour indiquer la valeur de la ligne
      this.axis.y.forEach(axis => {
        columns.push({
          type: 'scale',
          scale: axis
        })
      })

      // On ajoute une colonne par data
      Object.keys(this.data.query_params.data.fields).forEach(data => {
        this.data.query_params.data.fields[data].forEach(computeMode => {
          let evolDepth = this.getEvolDepth()
          for (let evol = 0; evol <= evolDepth; evol++) {
            columns.push({
              type: 'data',
              data: data,
              computeMode: computeMode,
              evol: evol,
              evolutionScale:
                this.data.query_params.evol &&
                this.data.query_params.evol.scale,
              nullValue: this.options.nullValue || '-'
            })
          }
        })
      })
    }

    // Duplication des columns par valeur sur les scale en X
    let indexes = {}
    this.data.results.forEach(result => {
      let idx = JSON.stringify(this.getColIndex(result))
      indexes[idx] = this.rows[idx] || []
      indexes[idx].push(result)
    })
    indexes = Object.keys(indexes).map(json => JSON.parse(json))

    this.columns = []
    columns.forEach(column => {
      if (column.type !== 'data') {
        this.columns.push(column)
        return;
      }
      indexes.forEach(index => {
        let col = cloneDeep(column)
        col.scales = index
        this.columns.push(col)
      })
    })
    let id = 0
    this.columns = this.columns.map(column => {
      id++
      if (typeof column.sortable === 'undefined') column.sortable = true
      column.id = id
      column.formatFunc =
        this.options.formats && this.options.formats[column[column.type]]
      if (column.type === 'scale') return new ScaleColumn(column, this)
      if (column.type === 'data') return new DataColumn(column, this)
      return new Column(column, this)
    })
  }
}

export default FpTable
