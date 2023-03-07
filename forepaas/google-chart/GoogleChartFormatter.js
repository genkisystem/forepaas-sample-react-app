
import has from 'lodash/has'
import get from 'lodash/get'

import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'

import Axis from './Axis'

class GoogleChartFormatter {
  constructor (forepaas) {
    // Load theme
    this.forepaas = forepaas
    this.generateAxis()
    this.generateOptions()
    this.generateRows()
    this.generateHeaderLabels()
    delete this.forepaas
    return this
  }

  generateOptions () {
    this.options = {}
    FpSdk.config.style = FpSdk.config.style || {}
    FpSdk.config.style.googleChart = get(FpSdk.config, 'style.googleChart') || {}
    FpSdk.Utils.merge(this.options, FpSdk.config.style.googleChart)
    FpSdk.Utils.merge(this.options, this.forepaas.options)
    this.type = (this.forepaas.options != null ? this.forepaas.options.type : undefined) || 'LineChart'
    return delete this.options.type
  }

  generateAxis () {
    this.axis = this.forepaas.request.scale.axis || {
      x: this.forepaas.request.scale.fields,
      y: []
    }
    this.axis = {
      x: new Axis(this.forepaas.options, ...this.axis.x),
      y: new Axis(this.forepaas.options, ...this.axis.y)
    }
    return this.axis
  }

  generateRows () {
    let scale, xComb
    const rows = [] // Initializing the rows, will be [[]]
    const headerRow = [''] // Initializing the header row

    let yCombs = {}
    let xCombs = {}
    for (var res of Array.from(this.forepaas.results)) {
      const yComb = {}
      for (scale of Array.from(this.axis.y)) {
        yComb[scale] = res.scales[scale]
      }
      const yKey = JSON.stringify(yComb)
      yCombs[yKey] = true
      xComb = {}
      for (scale of Array.from(this.axis.x)) {
        xComb[scale] = res.scales[scale]
      }
      const xKey = JSON.stringify(xComb)
      xCombs[xKey] = xCombs[xKey] || {}
      xCombs[xKey][yKey] = res
    }

    const sorted = xCombs
    yCombs = Object.keys(yCombs)
    xCombs = Object.keys(xCombs)

    // Getting the scale fields, that will be used to describe the first values of the header row
    Object.keys(this.forepaas.request.data.fields).forEach(data =>
      this.forepaas.request.data.fields[data].forEach(computeMode =>
        yCombs.forEach((yScales) => {
          headerRow.push({
            evol: '0',
            data,
            computeMode,
            yScales
          })
          if (has(this.forepaas, 'request.evol.scale')) {
            return headerRow.push({
              evol: '1',
              data,
              computeMode,
              yScales
            })
          }
        })
      )
    )

    // Pushing it to the main rows array
    rows.push(headerRow)
    for (xComb of Array.from(xCombs)) {
      const nextRow = [this.axis.x.format(JSON.parse(xComb))]
      for (let i = 0; i < headerRow.length; i++) {
        var serie = headerRow[i]
        if (i === 0) { continue }
        res = sorted[xComb][serie.yScales]
        nextRow.push(parseFloat(get(res, `data.${serie.data}.${serie.computeMode}.${serie.evol}.value`)) || 0)
      }
      rows.push(nextRow)
    }
    this.rows = rows
    return this
  }

  generateHeaderLabels () {
    this.rows[0] = this.rows[0].map((cell, i) => {
      if (i === 0) { return cell }
      let serieName = ''
      const yScales = JSON.parse(cell.yScales)
      if (Object.keys(yScales).length) {
        serieName += this.axis.y.format(yScales)
      }
      if (serieName) { serieName += ' ' }
      serieName += FpTranslate(cell.computeMode)
      if (serieName) { serieName += ' ' }
      serieName += FpTranslate(cell.data)
      if (has(this.forepaas, 'request.evol.scale')) {
        if (serieName) { serieName += ' ' }
        serieName += FpTranslate(`evol-${cell.evol}`)
      }
      return serieName
    })
    return this.rows[0]
  }
}

export default GoogleChartFormatter
