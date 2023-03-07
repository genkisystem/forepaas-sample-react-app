import React from 'react'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'

/**
 * This component is generally link to a chart
 *  It is used to display a list of action buttons
 *  like a button to export the content of a chart to an xlsx file
 * @example <Toolbar chart={{component:'echarts', request:{}}} options={{items:[{type:'export', options: {fileType:'xlsx'}}]}}></Toolbar>
 */
class Toolbar extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.chart - This is the chart members of {@link FpChart}
   * @param {Object} props.options - Various options to define the content of the toolbar
   * @param {Array<String>} props.options.position - Position of the toolbar
   * @param {Array<Object>} props.options.items - List of component use by toolbar
   * @example props.options.position = ['top', 'right'] || ['top', 'left'] || ['bottom', 'right'] || ['bottom', 'left']
   * @example props.options.items = [{"type":"export","options": {}}]
   */
  constructor (props) {
    super(props)
    this.state = {}
    this.items = this.props.options.items || []
    this.getPosition = this.getPosition.bind(this)
    this.getItems = this.getItems.bind(this)
  }

  /** Return all component to be displayed by the toolbar */
  getItems () {
    let components = this.items.map((item, index) => {
      var component
      if (FpSdk.modules[item.type]) component = FpSdk.modules[item.type]
      if (!component) {
        try {
          component = require(`./${item.type}`).default
        } catch (err) {
          console.error(err)
          return console.error('Component ' + item.type + ' required by toolbar not found.')
        }
      }
      if (component) {
        return React.createElement(component, {
          key: index,
          options: item.options,
          chart: this.props.chart,
          reload: this.props.reload
        })
      }
      return null
    })
    return components
  }

  /**
   * @return {Object} Get the position of the toolbar
   * @example return => {{top: '5px', right: '5px'}}
   */
  getPosition () {
    let style = {}
    let positions = ['top', 'right']
    if (this.props.options.position) positions = this.props.options.position.split('-')
    if (positions.length < 2) {
      if (positions[0] === 'right' || positions[0] === 'left') {
        positions[1] = positions[0]
        positions[0] = 'top'
      } else {
        positions[1] = 'right'
      }
    }
    style[positions[0]] = '5px'
    style[positions[1]] = '5px'
    style.position = 'absolute'
    return style
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div style={this.getPosition()} className='fp-toolbar'>
        {this.getItems()}
      </div>
    )
  }
}

Toolbar.propTypes = {
  chart: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  reload: PropTypes.func
}

Toolbar.defaultProps = {
  chart: {},
  options: {}
}

export default Toolbar
