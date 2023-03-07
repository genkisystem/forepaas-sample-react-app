import React from 'react'
import PropTypes from 'prop-types'

/**
 * Renders a modal
 */
export default class FpModal extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {bool} props.show - Shows the modal if true
   * @param {string} props.style - Adds style
   * @param {string} props.children - Shows the children if set
   */

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    if (this.props.show) {
      return (
        <div className='fp-modal' style={this.props.style}>
          <div className='fp-modal-wrapper'>
            <div className='fp-modal-background' onClick={() => this.props.onRequestClose()} />
            <div className='modal-dialog'>
              <div className='modal-content'>{ this.props.children }</div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
}

FpModal.propTypes = {
  show: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onRequestClose: PropTypes.func
}
