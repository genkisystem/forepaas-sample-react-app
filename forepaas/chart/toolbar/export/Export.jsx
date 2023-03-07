import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'

import FpQueryBuilder from 'forepaas/query-builder'

/**
 * This component is used to export a chart to a specific format
 * @example <Export chart={{component:'echarts', request:{}}} options={{}}></Export>
 */
class Export extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.chart - This is the chart members of {@link FpChart}
   * @param {Object} [props.options] - Various options to define the usage of the export button
   * @param {String} [props.options.fileType='xlsx'] - File download type
   */
  constructor (props) {
    super(props)
    this.state = {}
    this.export = this.export.bind(this)
  }

  /** Export the chart to a downloadable file */
  export () {
    let options = {}
    let title = get(this.props.chart, 'options.title.text') || 'chart'
    options.output = this.fileType
    options.queries = {}
    options.queries[title] = this.props.chart.request
    FpQueryBuilder.FpQuery.export(options)
      .then((_) => _)
      .catch((err) => console.error(err))
  }

  /** @type {String} */
  get icon () {
    let icons = {
      'xlsx': 'fa fa-file-excel-o'
    }
    return icons[get(this.props.options, 'fileType')] || 'fa fa-file-excel-o'
  }

  /** @type {String} */
  get fileType () {
    return get(this.props.options, 'fileType') || 'xlsx'
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let exportClass = `fp-toolbar-export ${this.icon}`
    return <i onClick={this.export} className={exportClass} />
  }
}

Export.propTypes = {
  options: PropTypes.object,
  chart: PropTypes.object.isRequired
}

export default Export
