import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'

import FpGrid from './FpGrid'
import FpGridItem from './FpGridItem.jsx'
import FpSdk from 'forepaas/sdk'

/**
 * Renders a grid layout
 */
export default class FpGridLayout extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array<Object>} props.items - Items of the layout
   */
  constructor (props) {
    super(props)
    this._id = this.props._id || `dashboarding['${this.props.dashboardId}']`
    this.renderItems = this.renderItems.bind(this)
    this.style = this.props.style || {}
    this.style.height = this.style.height || '100%'
    this.style.width = this.style.width || '100%'
    this.state = {
      items: this.props.items,
      grid: null
    }
  }
  reload () {
    let currentDashboard = get(FpSdk, 'config.dashboarding[' + this.props.dashboardId + ']')
    // Call library FpGrid, all the grid is in native javascript for be reusable in VueJS an Angular
    this.grid = new FpGrid(this.refs['grid-layout-inner'], {
      width: currentDashboard.width || 12,
      height: currentDashboard.height || 12,
      dashboardId: this.props.dashboardId,
      root: `dashboarding['${this.props.dashboardId}']`,
      id: this._id,
      lang: FpSdk.modules.store.getState().local.lang || FpSdk.config.lang,
      parent: this.props.gridChild,
      events: {
        refresh: (items, itemId, itemIdx) => {
          if (items[itemIdx]) {
            this.state.items[itemIdx] = null
            this.setState({ items: this.state.items })
            process.nextTick(_ => {
              this.state.items[itemIdx] = items[itemIdx]
              this.setState({ items: this.state.items })
            })
          } else {
            this.setState({ items: [] })
            process.nextTick(() => this.setState({ items }))
          }
          FpSdk.updateConfig(this._id, {items})
        },
        add: (item) => {
          this.state.items = this.state.items || []
          this.state.items.push(item)
          this.setState({ items: this.state.items })
          FpSdk.updateConfig(this._id, {items: this.state.items})
        },
        update: (id, item) => {
          this.grid.reset()
          let items = Object.assign([], this.state.items)
          items.splice(id, 1)
          this.setState({ items: [] })
          process.nextTick(() => {
            items.splice(id, 0, item)
            this.setState({ items })
            FpSdk.updateConfig(this._id, { items })
          })
        },
        delete: (idx) => {
          this.grid.reset()
          let items = Object.assign([], this.state.items)
          items.splice(idx, 1)
          this.setState({ items: [] })
          process.nextTick(() => {
            this.setState({ items })
            FpSdk.updateConfig(this._id, { items })
          })
        }
      }
    })
  }

  /**
   * componentDidMount
   */
  componentDidMount () {
    this.reload()
    this.setState({grid: this.grid})
  }

  componentWillUnmount () {
    if (!this.props.gridChild) {
      this.grid.delete()
    }
  }
  /**
   * renderItems
   * @return {ReactElement} markup
   */
  renderItems () {
    if (!this.state.grid) return null
    if (!this.state.items) return null

    return this.state.items.map((item, idx) => {
      if (!item) return null
      return (
        <FpGridItem
          ref={`grid-item-${idx}`}
          dashboardId={this.props.dashboardId}
          _id={this._id}
          item={item}
          key={idx}
          idx={idx}
          grid={this.state.grid}
        />
      )
    })
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = (this.props.customclass || '') + ' grid-layout'
    return (
      <div className={className} style={this.style}>
        <div ref='grid-layout-inner' className='grid-layout-inner'>
          {this.renderItems()}
        </div>
      </div>
    )
  }
}

FpGridLayout.propTypes = {
  _id: PropTypes.string,
  gridChild: PropTypes.object,
  dashboardId: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  customclass: PropTypes.string
}
