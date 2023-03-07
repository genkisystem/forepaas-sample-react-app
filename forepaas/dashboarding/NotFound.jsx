import React from 'react'
import PropTypes from 'prop-types'
import FpSdk from 'forepaas/sdk'

export default class NotFound extends React.Component {
  componentDidMount () {
    if (FpSdk.modules['google-analytics']) {
      const page = this.props.match.path
      FpSdk.modules['google-analytics'].track(page)
    }
  }
  render () {
    return <div className='not-found'>
      <div className='not-found-content'>
        <h3>404 page not found</h3>
        <p>We are sorry but the page you are looking for does not exist.</p>
      </div>
    </div>
  }
}

NotFound.propTypes = {
  match: PropTypes.object
}
