import React from 'react'
import PropTypes from 'prop-types'

/**
 * Shows the footer of the modal FpModal
 */
export default class FpModalFooter extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {string} props.style - Adds style
   * @param {string} props.children - Shows the children if set
   */

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div className='modal-footer' style={this.props.style}>{ this.props.children }</div>
    )
  }
}

FpModalFooter.propTypes = {
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.string
}
