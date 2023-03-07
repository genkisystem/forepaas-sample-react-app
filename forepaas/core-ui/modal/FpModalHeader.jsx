import React from 'react'
import PropTypes from 'prop-types'

/**
 * Renders the header of the modal FpModal
 */
export default class FpModalHeader extends React.Component {
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
      <div className='modal-header' style={this.props.style}>
        <div className='actions'>
          { this.props.onRequestClose &&
            <i className='fp fp-remove' onClick={() => this.props.onRequestClose()} />
          }
        </div>
        { this.props.children }
      </div>
    )
  }
}

FpModalHeader.propTypes = {
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRequestClose: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}
