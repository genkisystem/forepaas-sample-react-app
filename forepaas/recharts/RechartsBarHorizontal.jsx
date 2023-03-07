import React from 'react'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import get from 'lodash/get'

import Recharts from './Recharts.jsx'

export default class RechartsBarHorizontal extends Recharts {
  generateDecoration (state) {
    super.generateDecoration(state)
    state.series.forEach(serie => {
      serie._type = 'bar'
      serie.stroke = serie.stroke || serie.fill
    })
  }

  renderXLabel () {
    return ({ payload, x, y }) => {
      let { x: xOption, y: yOption, ...textOptions } = get(this.options, 'xAxis.tickStyle') || {}
      xOption = xOption || 0
      yOption = yOption || 0
      textOptions.textAnchor = textOptions.textAnchor || 'start'
      textOptions.fill = textOptions.fill || '#3E4550'
      textOptions.transform = textOptions.transform || ''
      textOptions.fontSize = textOptions.fontSize || '13'

      let label = payload.value
      if (this.state.xAxis.isTemporal()) {
        label = this.state.xAxis.formatFromTimestamp(payload.value)
      }

      return (
        <g transform={`translate(${x + xOption},${y + yOption})`}>
          <text x={0} y={0} dx={-8} dy={-8} {...textOptions}>{label}</text>
        </g>
      )
    }
  }

  renderYLabel (yAxis) {
    return ({ payload, x, y }) => {
      let { x: xOption, y: yOption, ...textOptions } = get(yAxis, 'tickStyle') || {}
      xOption = xOption || 0
      yOption = yOption || 0
      textOptions.textAnchor = textOptions.textAnchor || 'middle'
      textOptions.fill = textOptions.fill || '#97A7B7'
      textOptions.transform = textOptions.transform || ''
      textOptions.fontSize = textOptions.fontSize || '13'

      return (
        <g transform={`translate(${x + xOption},${y + yOption})`}>
          <text x={0} y={0} dy={0} {...textOptions}>{this.yAxisTickFormatter(payload.value, yAxis)}</text>
        </g>
      )
    }
  }

  // We switch the Yconfiguration with the Xconfiguration

  renderXAxis (xAxes) {
    xAxes = xAxes || [{}]
    if (!Array.isArray(xAxes)) xAxes = [xAxes]
    return xAxes.map((xAxis, i) => {
      if (this.state.xAxis.isTemporal()) {
        xAxis.domain = xAxis.domain || ['auto', 'auto']
      }
      if (xAxis.domain) this.generateYAxisDomain(xAxis.domain)
      xAxis.type = 'number'
      return <XAxis key={'x-' + i} tickCount={this.state.data.length || 5} tick={this.renderYLabel(xAxis)} {...xAxis} />
    })
  }

  renderYAxis (yAxes) {
    yAxes = yAxes || [{}]
    if (!Array.isArray(yAxes)) yAxes = [yAxes]
    return yAxes.map((yAxis, i) => {
      if (this.state.xAxis.isTemporal()) {
        yAxis.domain = yAxis.domain || ['auto', 'auto']
      }
      yAxis.dataKey = 'x'
      yAxis.type = 'category'
      yAxis.mirror = yAxis.mirror || true
      if (yAxis.domain) this.generateXAxisDomain(yAxis.domain)
      return <YAxis key={'y-' + i} tick={this.renderXLabel(yAxis)} {...yAxis} />
    })
  }

  render () {
    return (
      <ResponsiveContainer>
        <ComposedChart
          {...this.options}
          data={this.state.data}
          layout='vertical'
        >
          <CartesianGrid {...this.options.cartesianGrid} />
          {!get(this.options, 'legend.hide') && <Legend {...this.options.legend} />}
          {this.renderSeries()}
          {this.renderXAxis(this.options.yAxis)}
          {this.renderYAxis(this.options.xAxis)}
          <Tooltip content={this.renderTooltip()} />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }
}
