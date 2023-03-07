import React from 'react'
import PropTypes from 'prop-types'

import FpTranslate from 'forepaas/translate'

import FpAuthentication from '../../../FpAuthentication'

class Authenticator extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      qrCode: null
    }
  }

  handleChange (e) {
    this.props.onChange(e.target.value)
  }

  componentWillMount () {
    let authMode = this.props.preferences.auth_mode.find(am => am.type === 'mfa' && am.subtype === 'authenticator')
    if (!authMode) return console.error('Unexpected MFA Error')
    FpAuthentication.mfaConfiguration(this.props.user, authMode._id, this.props.preferences.name)
      .then(res => this.setState({qrCode: res.base64}))
      .catch(err => console.error(err))
  }

  renderQrCode () {
    if (this.state.qrCode) {
      return (
        <div className='qrCode'>
          <p>{ FpTranslate('fp.clientAuthorityManager.mfa.authenticator.scan_with_your_smartphone') }</p>
          <img src={`data:image/png;base64,${this.state.qrCode}`} />
        </div>
      )
    }
    return null
  }

  MissingField () {
    return (
      <div className='mfa-missingfield'>
        <div className='mfa-input-group input-group col-xs-12 material'>
          <div className='factorinput'>
            <input
              autoCapitalize='none'
              name='oneTimeValue'
              value={this.props.user.otp}
              onChange={this.props.onChange}
              type='text'
              placeholder={FpTranslate('fp.clientAuthorityManager.mfa.otp_placeholder')}
              className='form-control' />
          </div>
        </div>
        <div className='clearfix' />
      </div>
    )
  }

  MissingConfiguration () {
    return (
      <div className='mfa-missingconfiguration'>
        <p className='install-application'>{ FpTranslate('fp.clientAuthorityManager.mfa.authenticator.install_application') }</p>
        <div className='mfa-images'>
          <a className='appMfa' target='_blank' href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'>
            <img src='https://img.talkandroid.com/uploads/2013/07/google_play_logo_text_and_graphic_2016.png' />>
          </a>
          <a className='appMfa' target='_blank' href='https://itunes.apple.com/fr/app/google-authenticator/id388497605?mt=8'>
            <img src='https://images.apple.com/v/ios/app-store/b/images/overview/app_store_icon_medium.jpg' />
          </a>
        </div>
        {this.renderQrCode()}
        {this.MissingField()}
      </div>
    )
  }

  render () {
    if (typeof this[this.props.type] !== 'function') {
      return null
    }
    return (
      <form onSubmit={this.props.onSubmit} className='fp-authenticator'>
        {this[this.props.type]()}
        <div className='login-actions-container'>
          <div className='login-action-container return-container'>
            <button className='btn return-button' type='button' onClick={this.props.onClose}>Retour</button>
          </div>
          <div className='login-action-container send-container'>
            <button className='btn-login btn btn-primary' type='submit'>{FpTranslate('Login')}</button>
          </div>
        </div>
      </form>
    )
  }
}

Authenticator.propTypes = {
  type: PropTypes.string,
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  user: PropTypes.object,
  preferences: PropTypes.object,
  onSubmit: PropTypes.func
}

export default Authenticator
