import React from 'react'
import PropTypes from 'prop-types'

/**
 * Renders the body of the modal FpModal
 */
export default class FpModalBody extends React.Component {
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
      <div className='modal-body' style={this.props.style}>{this.props.children}</div>
    )
  }
}

FpModalBody.propTypes = {
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.object
}
