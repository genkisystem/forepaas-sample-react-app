import React from 'react'
import FpSdk from 'forepaas/sdk'
import PropTypes from 'prop-types'

/**
 * Renders the provided HTML element
 */
export default class FpHtml extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {string|Array} props.content - Content to display
   * @param {string} props.onClick - Action executed when the button is clicked
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  /**
   * Get interpreted content
   * @example <p>{Forepaas.modules.translate('My Awesome Button')}</p>
   */
  get content () {
    let propsContent = this.props.content
    if (Array.isArray(propsContent)) {
      propsContent = propsContent.join('')
    }
    let func = /[^{]+(?=}[^}]*$)/.exec(propsContent)
    if (func) {
      let content = propsContent.replace(/{[^}]*}/gmi, (value) => {
        let tmpValue = value.replace(/{|}/gmi, '')
        let result = new Function('FpSdk', `return ${tmpValue}`)(FpSdk)
        return typeof result !== 'undefined' ? result : value
      })
      return content
    }
    return propsContent
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
    let className = 'html'
    if (this.props.customclass) {
      className += ` ${this.props.customclass}`
    }
    return (
      <div
        className={className}
        style={this.props.style}
        onClick={this.handleClick}
        dangerouslySetInnerHTML={{ __html: this.content }}
      />
    )
  }
}

// Validations
FpHtml.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  onClick: PropTypes.string,
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
