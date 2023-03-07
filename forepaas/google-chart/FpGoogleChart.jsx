import React from 'react'
import PropTypes from 'prop-types'
import {Chart} from 'react-google-charts'

import FpLoader from 'forepaas/core-ui/loader'
import GoogleChartFormatter from './GoogleChartFormatter'

class FpGoogleChart extends React.Component {
  constructor (props) {
    super(props)
    this.results = this.props.chart.results
    this.options = this.props.chart.options
    this.style = this.props.style || {}
    this.style.height = this.style.height || '100%'
    this.state = {
      options: {},
      data: [],
      type: ''
    }
  }

  componentDidMount () {
    process.nextTick(() => {
      this.loadContent()
    })
  }

  loadContent () {
    let params = new GoogleChartFormatter({
      results: this.props.chart.data.results,
      request: this.props.chart.data.query_params,
      options: this.options
    })
    this.state.data = params.rows
    this.state.options = params.options
    this.state.type = params.type
    this.setState(this.state)
  }

  render () {
    const activeLegendToggle = this.state.data.length ? this.state.data[0].length < 22 : false

    return (
      this.state.type &&
        <Chart
          ref='chart'
          chartType={this.state.type}
          data={this.state.data}
          options={this.state.options}
          width='100%'
          height='100%'
          loader={<FpLoader />}
          legendToggle={activeLegendToggle}
        />
    )
  }
}

FpGoogleChart.propTypes = {
  chart: PropTypes.shape({
    data: PropTypes.object,
    options: PropTypes.object,
    results: PropTypes.array
  }),
  style: PropTypes.object
}

export default FpGoogleChart
