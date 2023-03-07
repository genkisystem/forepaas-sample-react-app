import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from 'rc-tooltip'
import cloneDeep from 'lodash/cloneDeep'

import FpSdk from 'forepaas/sdk'
import 'rc-tooltip/assets/bootstrap.css'

import FpContainerItem from './FpContainerItem'

class FpMenuItem extends React.Component {
  constructor (props) {
    super(props)
    this._id = `${this.props.containerId}.items[${this.props.idx}]`
    let item = cloneDeep(this.props.item)
    if (item) item.containerId = this.props.containerId
    this.state = {
      item,
      catchError: null
    }
  }

  componentDidMount () {
    // We create a native javasript FpContainerItem and we put it in parent FpContainer
    if (this.props.item && this.refs.elem) {
      this.state.item.containerItem = new FpContainerItem({
        id: this._id,
        idx: this.props.idx,
        original: this.props.item,
        element: this.refs.elem,
        containerId: this.props.containerId,
        root: this.props.containerId,
        parent: this.props.container
      })
      this.setState({item: this.state.item})
      this.props.container.add(this.state.item.containerItem)
    }
  }

  componentWillUnmount () {
    this.props.container.remove(this._id)
    if (this.state.item.containerItem && this.state.item.containerItem.FpContainerItemOptions) {
      this.state.item.containerItem.FpContainerItemOptions.removeSocketListener()
    }
  }

  componentDidCatch (error, errorInfo) {
    this.setState({ catchError: { error, errorInfo } })
  }

  get if () {
    if (this.props.item.if) {
      if (typeof (this.props.item.if) === 'function') return this.props.item.if(FpSdk)
      try {
        let func = new Function('FpSdk', this.props.item.if)
        if (typeof func === 'function') {
          return func(FpSdk)
        }
      } catch (err) {
        console.error(`There is a problem in your function: ${this.props.item.if}`)
        console.error(err)
      }
    }
    return true
  }

  getItem (item) {
    item = item || this.props.item
    var component = FpSdk.getModule(item.type)
    if (!component) {
      return <span>{`Component ${this.props.item.type} not found.`}</span>
    }
    let elem = React.createElement(component, item)
    return elem
  }

  renderLi () {
    return (
      <li style={this.props.item.style} id={this._id} ref='elem' className='menu-list'>
        {this.getItem()}
      </li>
    )
  }
  render () {
    if (this.state.catchError) {
      return <li className='menu-list' style={this.props.item.style}>{this.state.catchError.errorInfo.componentStack}</li>
    }
    if (!this.if) return null
    if (this.if) {
      if (this.props.item.tooltip) {
        let classTooltip = (this.props.menu.class || this.props.menu.id || '') + '-' + 'tooltip'
        let tooltipText = this.props.item.tooltip instanceof Object ? this.getItem(this.props.item.tooltip) : this.props.item.tooltip
        return (
          <Tooltip overlayClassName={classTooltip} placement='left' overlay={tooltipText}>
            {this.renderLi()}
          </Tooltip>
        )
      }
      return this.renderLi()
    }
    return null
  }
}

FpMenuItem.propTypes = {
  containerId: PropTypes.string,
  container: PropTypes.object,
  idx: PropTypes.number,
  item: PropTypes.object,
  menu: PropTypes.object
}
export default FpMenuItem
