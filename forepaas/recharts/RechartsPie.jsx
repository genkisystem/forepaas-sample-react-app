import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

import { FpDimensions, FpMeasure } from 'forepaas/formatter'
import FpTranslate from 'forepaas/translate'

class Recharts extends Component {
  get queryParams () { return this.props.chart.data.query_params }
  get results () { return this.props.chart.data.results }
  get options () { return this.props.chart.options || {} }

  get evolScale () { return this.queryParams.evol && this.queryParams.evol.scale }
  get evolDepth () {
    if (this.evolScale) return this.queryParams.evol.depth || 1
    return 0
  }

  state = {
    data: [],
    xAxis: new FpDimensions(get(this.queryParams, 'scale.axis.x') || get(this.queryParams, 'scale.fields') || []),
    yAxis: new FpDimensions(get(this.queryParams, 'scale.axis.y') || []),
    yCombinations: new Set(),
    xCombinations: new Set(),
    data2D: {},
    series: []
  }

  componentDidMount () {
    // We need to know x and y combinations to do the render
    let state = {
      yCombinations: new Set(),
      xCombinations: new Set(),
      data2D: {},
      series: [],
      data: []
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
            const key = data + '-' + computeMode + '-' + evol + '-' + y
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

  // Decorate chart with JSON options
  generateDecoration (state) {
    if (this.options.colors) {
      state.data.forEach((d, i) => {
        d._options.fill = this.options.colors[i % this.options.colors.length]
      })
    }
  }

  // Serie name will be generated from here
  getSerieName (data, computeMode, evol, y) {
    let scaleName = this.state.yAxis.map(axe => {
      return FpTranslate(axe + '-' + y[axe], { default: y[axe], i18n: this.options.i18n })
    }).join(' ')
    let name = [FpTranslate(computeMode, { i18n: this.options.i18n }), FpTranslate(data, { i18n: this.options.i18n })]
    if (this.evolScale) name.push(FpTranslate('evol-' + this.evolScale + '-' + evol, { i18n: this.options.i18n }))
    name.push(scaleName)
    return name.join(' ')
  }

  // Data need to be formated for recharts
  generateData (state) {
    state.xCombinations.forEach(x => {
      let res = {
        name: this.state.xAxis.format({ scales: JSON.parse(x) }).valueOf(),
        _x: x,
        _options: {}
      }
      state.series.forEach(serie => {
        res[serie.key] = state.data2D[x][serie._y].data[serie._data][serie._computeMode][serie._evol].value
      })
      state.data.push(res)
    })
  }

  renderLabel (serie) {
    return (props) => {
      if (this.options.labels === false) return null
      const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
      const { radiusRatio } = serie
      if (get(this.options, 'labels.minPercent') && get(this.options, 'labels.minPercent') > percent) return null
      const RADIAN = Math.PI / 180
      const radius = innerRadius + (outerRadius - innerRadius) * (radiusRatio || 2.5)
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + 10 + radius * Math.sin(-midAngle * RADIAN)

      return (
        <Fragment>
          <text x={x} y={y - 20} fill='#485465' fontSize={11} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>{name}</text>
          <text x={x} y={y} fill='#485465' fontSize={13} fontWeight={600} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        </Fragment>
      )
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
                {!this.options?.tooltip?.hideName && <div className='value' style={get(this.options, 'tooltip.style-name')}><i className='fa fa-circle' style={{ color, marginRight: '1px', opacity: p.fillOpacity ? p.fillOpacity : 1 }} />{`${p.name}:`}</div>}
                <div style={get(this.options, 'tooltip.style-value')}>{new FpMeasure(this.state.series[index]._data).setValue(p.value).toString()}</div>
              </div>
            )
          })}
        </div>
      )
    }
  }

  renderSeries () {
    return this.state.series.map(serie => {
      return (
        <Pie data={this.state.data} dataKey={serie.key} {...serie} label={this.renderLabel(serie)}>
          {this.state.data.map((entry, index) => <Cell key={index} {...this.state.data[index]._options} />)}
        </Pie>
      )
    })
  }

  render () {
    return (
      <ResponsiveContainer>
        <PieChart>
          {this.renderSeries()}
          <Tooltip content={this.renderTooltip()} />
        </PieChart>
      </ResponsiveContainer>
    )
  }
}

Recharts.propTypes = {
  chart: PropTypes.object
}

export default Recharts
