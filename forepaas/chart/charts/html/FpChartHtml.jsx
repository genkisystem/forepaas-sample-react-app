import React from 'react'
import PropTypes from 'prop-types'
import FpMeasure from 'forepaas/formatter/FpMeasure'
import {cloneDeep} from 'lodash'

class FpChartHtml extends React.Component {
  constructor (props) {
    super(props)
    this.request = this.props.chart.request
    this.options = this.props.chart.options || {}
    this.options.class = this.options.class || ''
    this.style = cloneDeep(this.props.style) || {}
    this.style.height = this.style.height || '100%'
    this.loadContent = this.loadContent.bind(this)
    this.state = {
      result: null
    }
    this.templates = {
      evol: `<div class='block-evol {scope.options.class}'>
        <i class="{scope.options.icon}"></i>
        <span class="value">{scope.value||0}</span>
        <span class="{scope.evolClass}">{scope.evol}%</span>
        <span class="text">{scope.options.text}</span>
      </div>`,
      block: `<div class='block {scope.options.class}'>
        <i class="{scope.options.icon}"></i>
        <span class="value">{scope.value||0}</span>
        <span class="text">{scope.options.text}</span>
      </div>`
    }
  }

  componentDidMount () {
    this.request.compute()
      .then((response) => {
        this.response = response
        this.loadContent()
      })
  }

  getValue (evol) {
    evol = evol || 0
    let query = this.props.chart.data.query_params
    let data = Object.keys(query.data.fields)[0]
    let cm = query.data.fields[data][0]
    if (!this.response.results.length) return 0
    return (this.response.results[0].data[data][cm][evol] && this.response.results[0].data[data][cm][evol].value) || 0
  }

  getEvol () {
    let past = this.getValue(1)
    if (!past) return 0
    return (((this.getValue(0) - past) / past) * 100).toFixed(2)
  }

  loadContent () {
    let data = Object.keys(this.props.chart.data.query_params.data.fields)[0]
    let template = this.getTemplate()
    let content = template.replace(/{[^}]*}/gmi, (value) => {
      value = value.replace(/{|}/gmi, '')
      let result = new Function('scope', `return ${value.toString()}`)({
        response: this.response,
        query_params: this.props.chart.data.query_params,
        options: this.options,
        value: new FpMeasure(data).setValue(this.getValue()).toString(),
        evolClass: this.getEvol() >= 0 ? 'evol positive' : 'evol negative',
        evol: this.props.chart.data.query_params.evol && this.props.chart.data.query_params != {} && this.getEvol()
      })
      return result
    })
    this.setState({result: content})
  }

  getTemplate () {
    let template = null
    if (this.options['template-name']) {
      template = this.templates[this.options['template-name']]
    }
    if (this.options['template']) {
      template = this.options.template
    }
    if (!template) {
      return 'No template set'
    }
    return template
  }

  render () {
    return (
      <div className='chart-html' ref='chart' style={this.style} dangerouslySetInnerHTML={{ __html: this.state.result }} />
    )
  }
}

FpChartHtml.propTypes = {
  chart: PropTypes.object,
  style: PropTypes.object
}

export default FpChartHtml
