import React from 'react'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'

/**
 * This is a simple button with click option
 * and html / text render
 */
export default class FpButton extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {string[]|string} props.text - Text inside the button, it can be html tags
   * @param {string} props.onClick - Action executed when the button is clicked
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  /**
   * Get interpreted text
   * @example <p>{FpSdk.modules.translate('My Awesome Button')}</p>
   */
  get text () {
    let propsText = this.props.text
    if (Array.isArray(propsText)) {
      propsText = propsText.join('')
    }
    let func = /[^{]+(?=}[^}]*$)/.exec(propsText)
    if (func) {
      let text = propsText.replace(/{[^}]*}/gmi, (value) => {
        value = value.replace(/{|}/gmi, '')
        let result = new Function('FpSdk', `return ${value}`)(FpSdk)
        return result
      })
      return text
    }
    return propsText
  }

  /**
   * handle click event on component click
   * @param {SytheticEvent} e
   */
  handleClick (e) {
    if (this.props.onClick) return new Function(this.props.onClick)()
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <button className={'fp-button ' + this.props.customclass} style={this.props.style} onClick={this.handleClick}>
        <span dangerouslySetInnerHTML={{ __html: this.text }} />
      </button>
    )
  }
}

// Validations
FpButton.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onClick: PropTypes.string,
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
