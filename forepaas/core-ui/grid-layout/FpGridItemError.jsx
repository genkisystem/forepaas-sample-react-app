import React from 'react'
import PropTypes from 'prop-types'
import omit from 'lodash/omit'
import cloneDeep from 'lodash/cloneDeep'

import FpTranslate from 'forepaas/translate'
import FpSdk from 'forepaas/sdk'

import FpGridChild from './FpGridChild'

class FpGridItemError extends React.Component {
  constructor (props) {
    super(props)
    let item = cloneDeep(this.props.item)
    if (item) item.dashboardId = this.props.dashboardId
    this.state = {
      item,
      tooltipStyle: {
        position: 'fixed'
      }
    }
  }
  componentWillMount () { this.setTooltipStyle() }
  componentDidMount () {
    if (this.props.item) {
      this.state.item.gridChild = new FpGridChild({
        id: this.props.item._id,
        idx: this.props.idx,
        original: omit(this.props.item, ['gridChild', 'error']),
        element: this.refs.elem,
        dashboardId: this.props.dashboardId,
        parent: this.props.grid
      })
      this.setState({item: this.state.item})
      this.props.grid.add(this.state.item.gridChild)
    }
  }

  componentWillUnmount () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
  setTooltipStyle () {
    this.interval = setInterval(_ => {
      if (this.refs.tooltip) {
        let offset = FpSdk.Utils.offset(this.refs.tooltip)
        this.setState({
          tooltipStyle: {
            position: 'fixed',
            top: offset.top + 25,
            left: offset.left + offset.width / 2
          }
        })
      }
    }, 200)
  }
  get tooltipStyle () {
    let style = { position: 'fixed' }
    if (this.refs.tooltip) {
      let offset = FpSdk.Utils.offset(this.refs.tooltip)
      style.top = offset.top + 25
      style.left = offset.left + offset.width / 2
    }
    return style
  }
  render () {
    return (
      <div ref='elem' className='error-component'>
        <p className='error-text'>{FpTranslate('fp.grid.item.error', [this.props.item.type])}</p>
        <div className='tooltip-container'>
          <p ref='tooltip'>
            {FpTranslate('fp.grid.item.error.hover_me')}
            <i className='fpui fpui-helper' />
          </p>
          <pre className='tooltip error-tooltip' style={this.state.tooltipStyle}>{this.props.item.error}</pre>
        </div>
      </div>
    )
  }
}

FpGridItemError.propTypes = {
  item: PropTypes.object,
  grid: PropTypes.object,
  dashboardId: PropTypes.string,
  idx: PropTypes.number
}

export default FpGridItemError
