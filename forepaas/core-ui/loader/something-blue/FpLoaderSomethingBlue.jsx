import React from 'react'
import PropTypes from 'prop-types'

import './FpLoaderSomethingBlue.css'

/**
 * Renders the spinner of the loader from FpLoader
 */
export default class FpLoaderSomethingBlue extends React.Component {
  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div id='preloader' className={(this.props.className || '') + ' fp-loader-something-blue'}>
        <div id='status'>
          <div className='fp-loader-something-blue-content' />
        </div>
      </div>
    )
  }
}

FpLoaderSomethingBlue.propTypes = {
  className: PropTypes.string
}
