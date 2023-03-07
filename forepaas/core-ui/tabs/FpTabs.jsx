import React from 'react'
import FpSdk from 'forepaas/sdk'
import PropTypes from 'prop-types'
import FpGrid from '../grid-layout/FpGrid'
import FpGridItem from '../grid-layout/FpGridItem.jsx'
import FpTabsHead from './FpTabsHead.jsx'

/**
 * Renders tabs
 */
export default class FpTabs extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array<Object>} props.items - Items to display
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this._id = this.props._id || `dashboarding['${this.props.dashboardId}']`
    this.setActive = this.setActive.bind(this)
    this.renderHeads = this.renderHeads.bind(this)
    this.state = {
      active: 0,
      items: this.props.items,
      grid: null
    }
  }

  componentDidMount () {
    // Call library FpGrid, all the grid is in native javascript for be reusable in VueJS an Angular
    this.grid = new FpGrid(this.refs['tab-layout-inner'], {
      dashboardId: this.props.dashboardId,
      id: this._id,
      resizable: false,
      lang: FpSdk.modules.store.getState().local.lang,
      parent: this.props.gridChild,
      events: {
        add: (item) => {
          this.state.items = this.state.items || []
          this.state.items.push(item)
          this.setState({ items: this.state.items })
          FpSdk.updateConfig(this._id, {items: this.state.items})
        },
        update: (id, item) => {
          let idx = this.state.items.findIndex((it) => it && it._id === id)
          if (idx === -1) return
          // If you get a better idea tell me
          delete this.state.items[idx]
          this.setState({ items: this.state.items })
          process.nextTick(_ => {
            this.state.items[idx] = item
            this.setState({ items: this.state.items })
            FpSdk.updateConfig(this._id, {items: this.state.items})
          })
        },
        delete: (id) => {
          let idx = this.state.items.findIndex((item) => item && item._id === id)
          if (idx === -1) return
          delete this.state.items[idx]
          this.setState({ items: this.state.items })
          FpSdk.updateConfig(this._id, {items: this.state.items})
        }
      }
    })
    this.setState({ grid: this.grid })
  }

  /**
   * Sets the selected tab as active
   * @param {number} index - Position of the tab
   */
  setActive (index) {
    if (this.state.items[index].disabled) return
    this.setState({
      active: index
    })
  }

  /**
   * renderItems
   * @return {ReactElement} markup
   */
  renderItems () {
    if (!this.state.grid) return null
    if (!this.state.items) return null

    return this.state.items.map((item, idx) => {
      if (idx !== this.state.active) return null
      return (
        <FpGridItem
          dashboardId={this.props.dashboardId}
          _id={this._id}
          item={item}
          key={idx}
          idx={idx}
          grid={this.grid}
        />
      )
    })
  }

  /**
   * renderHeads
   * @return {ReactElement} markup
   */
  renderHeads () {
    if (!this.state.grid) return null
    if (!this.state.items) return null
    return this.state.items.map((item, idx) => {
      if (!item) return null
      return <FpTabsHead
        onClick={() => this.setActive(idx)}
        key={idx}
        item={item}
        title={item.title}
        active={idx === this.state.active}
      />
    })
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = 'fp-tabs'
    if (this.props.customclass) { className += ' ' + this.props.customclass }
    return (
      <div className={className} style={this.props.style} ref='tab-layout-inner'>
        <ul className='fp-tabs-heads'>
          {this.renderHeads()}
        </ul>
        <div className='fp-tabs-content'>
          {this.renderItems()}
        </div>
      </div>
    )
  }
}

FpTabs.propTypes = {
  _id: PropTypes.string,
  gridChild: PropTypes.object,
  dashboardId: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
