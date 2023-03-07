import RechartsArea from './RechartsArea.jsx'
import React from 'react'
import { ComposedChart, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import get from 'lodash/get'

import { FpMeasure } from 'forepaas/formatter'

export default class RechartsAreaPercent extends RechartsArea {
  generateDecoration (state) {
    super.generateDecoration(state)
    state.series.forEach(serie => {
      serie.stackId = '1'
    })
  }

  componentDidMount () {
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

    // We add percentage data for render
    this.generatePercentData(state)

    // We add easy function to decorate easily chart with json options
    this.generateDecoration(state)

    // Update state
    this.setState(state, () => {
      this.componentIsReady()
    })
  }

  renderTooltip () {
    return ({ active, payload, label }) => {
      if (!payload) return null
      let name = label
      if (this.state.xAxis.isTemporal()) name = this.state.xAxis.formatFromTimestamp(label)
      if (!active) return null
      return (
        <div className='tooltip' style={get(this.options, 'tooltip.style')}>
          <p className='label'>{name}</p>
          {payload.map((p, index) => {
            const color = p.color === '#fff' || p.color === '#FFF' ? '#3E4550' : p.color
            let value = ((typeof (p.payload._original[p.dataKey]) !== 'undefined') && new FpMeasure(this.state.series[index]._data).setValue(p.payload._original[p.dataKey]).toString()) || ''
            return <p key={index} style={{ color }} className='value'>{`${p.name}: ${value} (${Math.round(p.value * 100)}%)`}</p>
          })}
        </div>
      )
    }
  }

  generatePercentData (state) {
    state.dataPercent = state.data.map(data => {
      let res = {
        _original: data,
        x: data.x
      }
      let total = 0
      state.series.forEach(serie => {
        if (data[serie.key]) total += data[serie.key]
      })
      state.series.forEach(serie => {
        if (total) {
          res[serie.key] = (data[serie.key] || 0) / total
        }
      })
      return res
    })
  }

  render () {
    return (
      <ResponsiveContainer>
        <ComposedChart
          margin={this.options.margin}
          data={this.state.dataPercent}
        >
          <CartesianGrid {...this.options.cartesianGrid} />
          <Legend {...this.options.legend} />
          {this.renderSeries()}
          <XAxis dataKey='x' tick={this.renderXLabel()} {...this.options.xAxis} />
          {this.renderYAxis(this.options.yAxis)}
          <Tooltip content={this.renderTooltip()} />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }
}
