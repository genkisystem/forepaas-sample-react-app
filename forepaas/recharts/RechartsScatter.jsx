import Recharts from './Recharts.jsx'
import React from 'react'
import { XAxis, YAxis, Scatter } from 'recharts'
import { FpDimensions } from 'forepaas/formatter'
import get from 'lodash/get'



export default class RechartsScatter extends Recharts {

    componentDidMount () {
        if (this.options.xAxisData) {
            this.setState({ xAxis: new FpDimensions([this.options.xAxisData]) }, () => super.generateChart()
            )
        } else {
            super.componentDidMount()
        }
    }

    getId (axis, result) {
        let id = {}
        axis.forEach(axe => {
            id[axe] = result.scales[axe]
            if (this.options.xAxisData) {
                id[axe] = result.data[axe].select[0].value
            }
        })
        return id
    }

    generateDecoration (state) {
        super.generateDecoration(state)
        state.series.forEach(serie => {
            serie._type = 'scatter'
            serie.stroke = serie.stroke || serie.fill
        })
    }

    renderSeries () {
        let renderedSeries = this.state.series
        renderedSeries.sort((s1, s2) => {
            if (s1.order < s2.order) return -1
            if (s1.order > s2.order) return 1
            return 0
        })
        if (this.options.xAxisData) {
            renderedSeries = renderedSeries.filter(serie => serie._data !== this.options.xAxisData)
        }
        return renderedSeries.map((serie) => {
            return (
                <Scatter dataKey={serie.key} {...serie} label={(props) => this.renderCustomizedLabel(props, serie, this.state.data.length)} />
            )
        })
    }

    renderXAxis (xAxes) {
        xAxes = xAxes || [{}]
        if (!Array.isArray(xAxes)) xAxes = [xAxes]
        return xAxes.map((xAxis, i) => {

            xAxis.domain = xAxis.domain || ['auto', 'auto']
            xAxis.type = xAxis.type || 'number'
            if (xAxis.domain) this.generateXAxisDomain(xAxis.domain)
            if (this.options.xAxisData) {
                let seriesObject = this.state.series.reduce((obj, item) => (obj[item._data] = item, obj), {});
                let { interval, ...xAxisProps } = xAxis
                return seriesObject[this.options.xAxisData] && <XAxis {...xAxisProps} label={{ value: this.options.xAxisName, position: "top", offset: -15, ...xAxisProps.labelStyle }} key={'x-' + i} dataKey={seriesObject[this.options.xAxisData].key || "x"} tickCount={5} tick={this.renderYLabel(xAxis)} />
            } else {
                return <XAxis key={'x-' + i} dataKey='x' tickCount={this.state.data.length || 5} tick={this.renderXLabel(xAxis)} />

            }
        })
    }

    renderYAxis (yAxes) {
        yAxes = yAxes || [{}]
        if (!Array.isArray(yAxes)) yAxes = [yAxes]
        return yAxes.map((yAxis, i) => {
            if (yAxis.domain) this.generateYAxisDomain(yAxis.domain)
            return <YAxis label={{ value: this.options.yAxisName, ...yAxis.labelStyle }} key={'y-' + i} tick={this.renderYLabel(yAxis)} {...yAxis} />
        })
    }
}
