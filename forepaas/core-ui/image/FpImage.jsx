import React from 'react'
import PropTypes from 'prop-types'

/**
 * Renders the provided image
 */
export default class FpImage extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {string} props.src - Content to display
   * @param {string} props.onClick - Action executed when the button is clicked
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   * @param {string} props.alt - Specifies an alternate text for an image, if the image cannot be displayed
   * @param {string|number} props.width - Specifies the image width
   * @param {string|number} props.height - Specifies the image height
   */
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
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
      <img className={'fp-image ' + this.props.customclass} style={this.props.style} src={this.props.src} alt={this.props.alt} width={this.props.width} height={this.props.height} />
    )
  }
}

// Validations
FpImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onClick: PropTypes.string,
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
