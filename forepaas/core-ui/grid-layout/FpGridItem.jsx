import React from 'react'
import PropTypes from 'prop-types'
import FpSdk from 'forepaas/sdk'
import FpGridChild from './FpGridChild'
import FpGridItemError from './FpGridItemError.jsx'
import {cloneDeep} from 'lodash'

export default class FpGridItem extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array<Object>} props.item - Item to display
   */
  constructor (props) {
    super(props)
    let item = cloneDeep(this.props.item)
    if (item) item.dashboardId = this.props.dashboardId
    this.state = {
      item: item,
      catchError: null
    }
    if (this.state.item) this.state.item._id = this.props._id + `.${this.props.itemKey}[${this.props.idx}]`
  }

  componentDidCatch (error, errorInfo) {
    this.setState({ catchError: { error, errorInfo } })
  }

  /**
   * getItem
   * @param {object} item - Item to get
   * @param {number} idx - Position of the item
   */
  getItem () {
    if (!this.state.item.gridChild) return null
    var component = FpSdk.getModule(this.state.item.type)
    if (this.state.catchError) {
      this.state.item.error = this.state.catchError.errorInfo.componentStack
      return React.createElement(FpGridItemError, {
        item: this.state.item,
        grid: this.props.grid,
        id: this.state.item._id,
        idx: this.props.idx,
        original: this.props.item,
        dashboardId: this.props.dashboardId
      })
    }
    if (!component) {
      this.state.item.error = `Component ${this.state.item.type} required by module grid-layout not found.`
      return React.createElement(FpGridItemError, { item: this.state.item })
    }
    return React.createElement(component, this.state.item)
  }

  /**
   * componentDidMount
   */
  componentDidMount () {
    // We create a native javasript FpGridChild and we put it in parent FpGrid
    if (this.props.item && this.refs.elem) {
      this.state.item.gridChild = new FpGridChild({
        id: this.state.item._id,
        idx: this.props.idx,
        original: this.props.item,
        element: this.refs.elem,
        dashboardId: this.props.dashboardId,
        root: `dashboarding['${this.props.dashboardId}']`,
        parent: this.props.grid
      })
      this.setState({item: this.state.item})
      this.props.grid.add(this.state.item.gridChild)
    }
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    if (!this.state.item) return null
    return (
      <div ref='elem'>
        {this.getItem(this.state.item)}
      </div>
    )
  }
}

FpGridItem.propTypes = {
  _id: PropTypes.string,
  item: PropTypes.object,
  grid: PropTypes.object,
  dashboardId: PropTypes.string,
  itemKey: PropTypes.string,
  idx: PropTypes.number
}

FpGridItem.defaultProps = {
  itemKey: 'items'
}
