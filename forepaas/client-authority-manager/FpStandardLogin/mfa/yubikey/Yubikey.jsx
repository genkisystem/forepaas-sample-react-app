import React from 'react'
import PropTypes from 'prop-types'

import FpTranslate from 'forepaas/translate'

import InstallYubikeyImage from './install_yubikey.png'

class Yubikey extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      step: 'fp.clientAuthorityManager.mfa.yubikey.waiting'
    }
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  handleChange (e) {
    this.props.onChange(e.target.value)
  }

  componentWillMount () {
    let authMode = this.props.preferences.auth_mode.find(am => am.type === 'mfa' && am.subtype === 'yubikey')
    if (!authMode) return console.error('Unexpected MFA Error')
  }

  componentDidMount () {
    window.addEventListener('keypress', this.onKeyPress)
  }

  componentWillUnmount () {
    window.removeEventListener('keypress', this.onKeyPress)
  }

  componentWillReceiveProps () {
    if (this.props.user.otp.length === 0) {
      this.setState({step: 'fp.clientAuthorityManager.mfa.yubikey.waiting'})
    }
  }

  compo
  onKeyPress (e) {
    let obj = {target: {}}
    if (e.keyCode !== 13) {
      if (this.props.user.otp.length < 20) {
        this.setState({step: 'fp.clientAuthorityManager.mfa.yubikey.getting'})
      } else {
        this.setState({step: 'fp.clientAuthorityManager.mfa.yubikey.validation'})
      }
      obj.target.value = `${this.props.user.otp}${e.key}`
      this.props.onChange(obj)
    }
    if (e.keyCode === 13) {
      return this.props.onSubmit()
    }
  }

  MissingField () {
    return (
      <div className='yubikey-missingfield'>
        <div className='mfa-images'>
          <img src={InstallYubikeyImage} alt='Install yubikey' />
        </div>
        <p className='yub-info'>{FpTranslate(this.state.step)}</p>
        <div className='clearfix' />
      </div>
    )
  }

  MissingConfiguration () {
    return this.MissingField()
  }

  render () {
    if (typeof this[this.props.type] !== 'function') {
      return null
    }
    return (
      <form onSubmit={this.props.onSubmit} className='fp-yubikey'>
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

Yubikey.propTypes = {
  type: PropTypes.string,
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  user: PropTypes.object,
  preferences: PropTypes.object,
  onSubmit: PropTypes.func
}

export default Yubikey
