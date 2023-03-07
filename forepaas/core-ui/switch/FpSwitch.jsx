import React from 'react'
import {connect} from 'react-redux'
import FpSdk from 'forepaas/sdk'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep'

import FpGrid from '../grid-layout/FpGrid'
import FpGridItem from '../grid-layout/FpGridItem.jsx'

@connect(state => ({
  store: {
    querystring: state.querystring
  }
}))

/**
 * Renders a switch (true/false) element
 */
export default class FpSwitch extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array<Object>} props['dynamic-parameters'] - Dynamic parameters to add
   * @param {Object<Array>} props.store - This is set by the decorator, connect to Redux store
   * @param {Array<Object>} props.items - ?
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.state = {
      element: null,
      grid: null,
      items: cloneDeep(this.props.items)
    }
    this.dynamicParameters = (Array.isArray(this.props['dynamic-parameters']) && this.props['dynamic-parameters']) || []
  }

  /**
   * After the component is mounted,
   * each dynamic parameters will be subscribed
   */
  componentDidMount () {
    let grid = new FpGrid(this.refs['switch-layout-inner'], {
      dashboardId: this.props.dashboardId,
      id: this._id,
      resizable: false,
      lang: FpSdk.modules.store.getState().local.lang,
      parent: this.props.gridChild,
      events: {
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
        }
      }
    })
    this.setState({ grid })
    this.dynamicParameters.forEach(param => {
      FpSdk.modules.store.subscribeKey(`querystring.${param}`, () => {
        this.forceUpdate()
      })
    })
  }
  /**
   * Checks if the dynamic parameter is ready
   * @param {string} key - Argument to check if it's ready
   */
  isReady (key) {
    let scope = {}
    this.dynamicParameters.forEach((dynamicParam) => {
      scope[dynamicParam] = this.props.store.querystring[dynamicParam]
    })
    return new Function('return ' + key).bind(scope)()
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = ['fp-switch']
    if (this.props.customclass) className.push(this.props.customclass)
    return (
      <div className={className.join(' ')} style={this.props.style} ref='switch-layout-inner'>
        {this.state.grid && Array.isArray(this.state.items) && this.state.items.map((item, idx) => {
          if (this.isReady(item.case)) {
            return <FpGridItem
              dashboardId={this.props.dashboardId}
              _id={this.props._id}
              item={item}
              key={idx}
              idx={idx}
              grid={this.state.grid}
            />
          }
        })}
      </div>
    )
  }
}

FpSwitch.propTypes = {
  _id: PropTypes.string,
  gridChild: PropTypes.object,
  dashboardId: PropTypes.string,
  'dynamic-parameters': PropTypes.arrayOf(PropTypes.string),
  items: PropTypes.arrayOf(PropTypes.object),
  store: PropTypes.object,
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
