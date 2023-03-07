import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'

import FpSdk from 'forepaas/sdk'

class FpDropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      active: false
    }
  }

  componentWillMount () {
    if (FpSdk.modules.store) {
      FpSdk.modules.store.subscribeKey('memory.fp-application-route', (value) => {
        if (!this.props.isNav) return
        // We use proocess.nextTick to wait for the children components
        // to rerender
        process.nextTick(_ => {
          let isActive = false
          Object.keys(this.refs).forEach(key => {
            if (value.hash.split('?')[0].substring(1) === ref.props.url) isActive = true
          })
          this.setState({active: isActive})
        })
      })
    }
  }

  /**
   * @param {object} item - Item containing the error
   */
  getComponentError (item) {
    let error = `Component ${item.type} required by module grid-layout not found.`
    console.error(error)
    return (
      <div className='error-component'>
        <p className='error-text'>{error}</p>
      </div>
    )
  }

  /**
   * @param {object} item - Item to get
   * @param {number} idx - Position of the item
   */
  getItem (item, idx) {
    var component = FpSdk.getModule(item.type)
    if (!component) {
      return this.getComponentError(item)
    }
    item.isNav = this.props.isNav
    item.key = idx
    item.ref = `item-${idx}`
    return React.createElement(component, item)
  }

  get title () {
    let func = /[^{]+(?=}[^}]*$)/.exec(this.props.title)
    if (func) {
      let title = this.props.title.replace(/{[^}]*}/gmi, (value) => {
        value = value.replace(/{|}/gmi, '')
        let result = new Function('FpSdk', `return ${value}`)(FpSdk)
        return result
      })
      return title
    }
    return this.props.title
  }

  render () {
    let className = 'fp-dropdown'
    if (this.props.customclass) className += ` ${this.props.customclass}`
    if (this.state.active) className += ` active`
    return (
      <div style={this.props.style} className={className}>
        <a className='fp-dropdown-title' onClick={e => e.preventDefault()} href='#'>
          { this.props.icon && <i className={this.props.icon} />}
          <span>{this.title}</span>
        </a>
        <ul className='dropdown-items'>
          {this.props.items && this.props.items.map((item, idx) => this.getItem(item, idx))}
        </ul>
      </div>
    )
  }
}

FpDropdown.propTypes = {
  title: PropTypes.string,
  customclass: PropTypes.string,
  icon: PropTypes.string,
  items: PropTypes.array,
  isNav: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default FpDropdown
