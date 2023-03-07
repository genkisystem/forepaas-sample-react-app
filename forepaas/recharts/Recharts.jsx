import React from 'react'
import PropTypes from 'prop-types'
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

import { FpDimensions, FpMeasure } from 'forepaas/formatter'
import FpTranslate from 'forepaas/translate'

const Types = {
  bar: Bar,
  line: Line,
  area: Area,
  scatter: Scatter
}

class Recharts extends React.Component {
  get queryParams () { return this.props.chart.data.query_params }
  get results () { return this.props.chart.data.results }
  get options () { return this.props.chart.options || {} }
  get evolScale () { return this.queryParams.evol && this.queryParams.evol.scale }
  get evolDepth () {
    if (this.evolScale) return this.queryParams.evol.depth || 1
    return 0
  }

  state = {
    xAxis: new FpDimensions(get(this.queryParams, 'scale.axis.x') || get(this.queryParams, 'scale.fields') || []),
    yAxis: new FpDimensions(get(this.queryParams, 'scale.axis.y') || []),
    yCombinations: new Set(),
    xCombinations: new Set(),
    data: [],
    data2D: {},
    series: []
  }

  componentDidMount () {
    this.generateChart()
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!isEqual(this.state, nextState)) return true
    if (isEqual(this.results, nextProps.chart.data.results)) return false
    process.nextTick(_ => {
      this.generateChart()
    })
    return true
  }

  generateChart () {
    // We need to know x and y combinations to do the render
    let state = {
      yCombinations: new Set(),
      xCombinations: new Set(),
      data: [],
      data2D: {},
      series: []
    }
    this.generateCombination(state)

    // We do a loop over data, compute mode, evolution and y combinations to generate Series
    this.generateSeries(state)

    // We can now generate data object for recharts library
    this.generateData(state)

    // We add easy function to decorate easily chart with json options
    this.generateDecoration(state)

    // Update state
    this.setState(state, () => {
      this.componentIsReady()
    })
  }

  // Hook for add custom logic after componentReady
  componentIsReady () {

  }

  // Id will be use to get combination over x and y axis
  getId (axis, result) {
    let id = {}
    axis.forEach(axe => {
      id[axe] = result.scales[axe]
    })
    return id
  }

  // We generate 2d table, and combinations on x and y
  generateCombination (state) {
    this.results.forEach(result => {
      const yId = this.getId(this.state.yAxis, result)
      const xId = this.getId(this.state.xAxis, result)
      // We don't want to update the props
      result = cloneDeep(result)
      result.xId = xId
      result.yId = yId
      state.xCombinations.add(JSON.stringify(xId))
      state.yCombinations.add(JSON.stringify(yId))
      state.data2D[JSON.stringify(xId)] = state.data2D[JSON.stringify(xId)] || {}
      state.data2D[JSON.stringify(xId)][JSON.stringify(yId)] = result
    })
  }

  // Series will be generated from data, computeMode, evolution and y combinations
  generateSeries (state) {
    Object.keys(this.queryParams.data.fields).forEach(data => {
      this.queryParams.data.fields[data].forEach(computeMode => {
        for (let evol = 0; evol <= this.evolDepth; evol++) {
          state.yCombinations.forEach(y => {
            let values = []
            let keys = JSON.parse(y)
            for (let k in keys) {
              values.push(k + '-' + keys[k])
            }
            values.unshift(evol)
            values.unshift(computeMode)
            values.unshift(data)

            const key = values.join('_')
            const serieOptions = cloneDeep(get(this.options, `series.${key}`) || get(this.options, `series[${state.series.length}]`) || get(this.options, `series`) || {})
            state.series.push(Object.assign({
              _data: data,
              _computeMode: computeMode,
              _evol: evol,
              _y: y,
              key: key,
              name: this.getSerieName(data, computeMode, evol, JSON.parse(y))
            }, serieOptions))
          })
        }
      })
    })

    return this.series
  }

  // Serie name will be generated from here
  getSerieName (data, computeMode, evol, y) {
    let scaleName = this.state.yAxis.map(axe => {
      return FpTranslate(axe + '-' + y[axe], { default: y[axe], i18n: this.options.i18n })
    }).join(' ')
    let name = [FpTranslate(computeMode, { i18n: this.options.i18n }), FpTranslate(data, { i18n: this.options.i18n })]
    if (this.evolScale) name.push(FpTranslate('evol-' + this.evolScale + '-' + evol, { i18n: this.options.i18n }))
    name.push(scaleName)
    name = name.filter(n => n)
    return name.join(' ')
  }

  // Data need to be formated for recharts
  generateData (state) {
    state.xCombinations.forEach(x => {
      let res = {
        x: this.state.xAxis.format({ scales: JSON.parse(x) }).valueOf()
      }
      state.series.forEach(serie => {
        res[serie.key] = get(state.data2D, `[${x}][${serie._y}].data[${serie._data}][${serie._computeMode}][${serie._evol}].value`)
      })
      state.data.push(res)
    })
  }

  // Decorate chart with JSON options
  generateDecoration (state) {
    if (this.options.colors) {
      state.series.forEach((serie, i) => {
        serie.fill = this.options.colors[i % this.options.colors.length]
      })
    }
  }

  renderTooltip () {
    return ({ active, payload, label }) => {
      if (!payload) return null
      let name = label
      if (this.state.xAxis.isTemporal()) name = this.state.xAxis.formatFromTimestamp(label)
      if (!active) return null
      return (
        <div className='tooltip' style={get(this.options, 'tooltip.style')}>
          <div className='label' style={get(this.options, 'tooltip.style-label')}>{name}</div>
          {payload.map((p, index) => {
            let color = p.fill
            if (color === '#fff' || color === '#FFF' || (color && color[0] !== '#' && color[0] !== 'r')) color = p.stroke === '#fff' || p.stroke === '#FFF' ? '#FFF' : p.stroke
            return (
              <div key={index} style={get(this.options, 'tooltip.style-content')}>
                {this.options.tooltip && !this.options.tooltip.hideName && <div className='value' style={get(this.options, 'tooltip.style-name')}><i className='fa fa-circle' style={{ color, marginRight: '3px', opacity: p.fillOpacity ? p.fillOpacity : 1 }} />{`${p.name}:`}</div>}
                <div style={get(this.options, 'tooltip.style-value')}>{new FpMeasure(get(this.state.series[index], '_data')).setValue(p.value).toString()}</div>
              </div>
            )
          })}
        </div>
      )
    }
  }

  renderXLabel () {
    return ({ payload, x, y }) => {
      let { x: xOption, y: yOption, rotate, ...textOptions } = get(this.options, 'xAxis.tickStyle') || {}
      xOption = xOption || 0
      yOption = yOption || 0
      rotate = rotate || 0
      textOptions.textAnchor = textOptions.textAnchor || 'middle'
      textOptions.fill = textOptions.fill || '#3E4550'
      textOptions.transform = textOptions.transform || ''
      textOptions.fontSize = textOptions.fontSize || '13'

      let label = payload.value
      if (this.state.xAxis.isTemporal()) {
        label = this.state.xAxis.formatFromTimestamp(payload.value)
      }
      return (
        <g transform={`translate(${x + xOption},${y + yOption}) rotate(${rotate})`}>
          <text x={0} y={0} dy={16} {...textOptions}>{label}</text>
        </g>
      )
    }
  }

  renderYLabel (yAxis) {
    return ({ payload, x, y }) => {
      let { x: xOption, y: yOption, rotate, ...textOptions } = get(yAxis, 'tickStyle') || {}
      xOption = xOption || 0
      yOption = yOption || 0
      rotate = rotate || 0
      textOptions.textAnchor = textOptions.textAnchor || 'middle'
      textOptions.fill = textOptions.fill || '#97A7B7'
      textOptions.transform = textOptions.transform || ''
      textOptions.fontSize = textOptions.fontSize || '13'
      return (
        <g transform={`translate(${x + xOption},${y + yOption}) rotate(${rotate})`}>
          <text x={0} y={0} dy={0} {...textOptions}>{this.yAxisTickFormatter(payload.value, yAxis)}</text>
        </g>
      )
    }
  }

  yAxisTickFormatter (value, yAxis) {
    if (!yAxis.fpFormat) return value
    return new FpMeasure(yAxis.fpFormat).setValue(value).toString()
  }

  renderCustomizedLabel = ({ x, y, value, index }, serie, dataLength) => {
    if ((serie.label && dataLength <= 25) || (serie.label && dataLength > 25 && dataLength <= 50 && index % 2 === 0) || (serie.label && dataLength > 50 && index % 4 === 0)) {
      return (
        <text x={x} y={y} dy={-10} fill={serie.labelColor} fontSize={11} textAnchor={serie.labelTextAnchor || 'middle'}>{new FpMeasure(serie._data).setValue(value).toString()}</text>
      )
    }
    return null
  }

  renderSeries () {
    this.state.series.sort((s1, s2) => {
      if (s1.order < s2.order) return -1
      if (s1.order > s2.order) return 1
      return 0
    })
    return this.state.series.map((serie) => {
      let Type = Types[serie._type || 'line']
      return (
        <Type dataKey={serie.key} {...serie} label={(props) => this.renderCustomizedLabel(props, serie, this.state.data.length)} />
      )
    })
  }

  generateXAxisDomain (domain) {
    domain.forEach((value, i) => {
      if (value && typeof value === 'string' && value.indexOf('=>') !== -1) {
        let tmp = value.split('=>')
        domain[i] = new Function(tmp[0], 'return ' + tmp[1])
      }
    })
    return domain
  }

  generateYAxisDomain (domain) {
    domain.forEach((value, i) => {
      if (value && typeof value === 'string' && value.indexOf('=>') !== -1) {
        let tmp = value.split('=>')
        domain[i] = new Function(tmp[0], 'return ' + tmp[1])
      }
    })
    return domain
  }

  renderXAxis (xAxes) {
    xAxes = xAxes || [{}]
    if (!Array.isArray(xAxes)) xAxes = [xAxes]
    return xAxes.map((xAxis, i) => {
      if (this.state.xAxis.isTemporal()) {
        xAxis.domain = xAxis.domain || ['auto', 'auto']
        xAxis.type = xAxis.type || 'number'
      }
      if (xAxis.domain) this.generateXAxisDomain(xAxis.domain)
      return <XAxis key={'x-' + i} dataKey='x' tickCount={this.state.data.length || 5} tick={this.renderXLabel(xAxis)} {...xAxis} />
    })
  }

  renderYAxis (yAxes) {
    yAxes = yAxes || [{}]
    if (!Array.isArray(yAxes)) yAxes = [yAxes]
    return yAxes.map((yAxis, i) => {
      if (yAxis.domain) this.generateYAxisDomain(yAxis.domain)
      return <YAxis key={'y-' + i} tick={this.renderYLabel(yAxis)} {...yAxis} />
    })
  }

  render () {
    return (
      <ResponsiveContainer>
        <ComposedChart
          {...this.options}
          data={this.state.data}
        >
          <CartesianGrid {...this.options.cartesianGrid} />
          {!get(this.options, 'legend.hide') && <Legend {...this.options.legend} />}
          {this.renderSeries()}
          {this.renderXAxis(this.options.xAxis)}
          {this.renderYAxis(this.options.yAxis)}
          <Tooltip content={this.renderTooltip()} />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }
}

Recharts.propTypes = {
  chart: PropTypes.object
}

export default Recharts
