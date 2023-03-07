import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import FpSdk from 'forepaas/sdk'

@connect((state) => ({
  local: state.local
}))

/**
 * Renders the curent logged username
 */
export default class FpUsername extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object<Array>} props.local - Redux local store
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   * @param {string} props.format - Formatter for username
   */
  constructor (props) {
    super(props)
    this.state = {}
    this.handleClick = this.handleClick.bind(this)
  }

  get username () {
    if (this.props.local && this.props.local['client-authority-manager-session']) {
      return this.props.local['client-authority-manager-session'].user
    }
    return 'Not connected'
  }

  get content () {
    if (!this.props.format) return this.username
    let propsFormat = this.props.format
    if (Array.isArray(propsFormat)) {
      propsFormat = propsFormat.join('')
    }
    let func = /[^{]+(?=}[^}]*$)/.exec(propsFormat)
    if (func) {
      let content = propsFormat.replace(/{[^}]*}/gmi, (value) => {
        let tmpValue = value.replace(/{|}/gmi, '')
        if (tmpValue === 'username') return this.username
        let result = new Function('FpSdk', `return ${tmpValue}`)(FpSdk)
        return typeof result !== 'undefined' ? result : value
      })
      return content
    }
    return propsFormat
  }

  /**
   * handle click event on component click
   * @param {SytheticEvent} e
   */
  handleClick (e) {
    if (this.props.onClick) {
      return new Function('FpSdk', this.props.onClick)(FpSdk)
    }
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div
        style={this.props.style}
        className={`fp-username ${this.props.customclass ? this.props.customclass : ''}`}
        dangerouslySetInnerHTML={{ __html: this.content }}
        onClick={this.handleClick}
      />
    )
  }
}

FpUsername.propTypes = {
  local: PropTypes.object,
  customclass: PropTypes.string,
  style: PropTypes.object,
  format: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onClick: PropTypes.func
}
