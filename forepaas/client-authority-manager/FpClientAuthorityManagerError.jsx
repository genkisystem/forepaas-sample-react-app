/*
  You can override that error from your code

  Just copy paste that one in MyClientAuthorityManagerError.jsx
  and then put that line of codes after starting the SDK

  FpSdk.modules['client-authority-manager-error'] = require('./MyClientAuthorityManagerError.jsx')

*/

import FpTranslate from 'forepaas/translate'
import PropTypes from 'prop-types'
import React from 'react'
import FpHeaderLogin from './FpHeaderLogin.jsx'
import forepaasFullLogo from './assets/logofull.png'
import dots from './assets/dots.png'

class ClientAuthorityManagerCustomErrror extends React.Component {
  render () {
    return (
      <div className={`fp-client-authority-manager-container ${this.props.configuration.displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={this.props.configuration.image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager error'>
          <FpHeaderLogin
            title={this.props.error.message}
            text={this.props.error.description}
            logo={forepaasFullLogo}
            dots={dots}
          />

          <div className='login-action-container send-container'>
            <button className='btn-retry btn btn-primary' onClick={() => this.props.retry()}>{FpTranslate('Retry')}</button>
          </div>
        </div>
      </div>
    )
  }
}

ClientAuthorityManagerCustomErrror.propTypes = {
  error: PropTypes.object,
  preferences: PropTypes.object,
  configuration: PropTypes.object,
  retry: PropTypes.func
}

export default ClientAuthorityManagerCustomErrror
