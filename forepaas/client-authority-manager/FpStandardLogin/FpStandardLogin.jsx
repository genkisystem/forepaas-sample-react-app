import React from 'react'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import FpToaster from 'forepaas/toaster'
import FpLoader from 'forepaas/core-ui/loader'
import FpAuthentication from '../FpAuthentication'
import FpPasswordForgot from '../FpPasswordForgot/FpPasswordForgot.jsx'
import Mfa from './mfa'

class FpClientAuthorityManager extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      form: {
        login: '',
        password: '',
        auth_mode_id: props.auth_mode._id
      },
      forgotPassword: false,
      mfa: null,
      return: props.preferences.auth_mode.filter(auth => (typeof auth.visible === 'undefined' || auth.visible) && auth.type !== 'mfa' && !auth.hidden).length > 1,
      color: this.props.preferences.color || '#00CCF9'
    }
    this.loginAction = this.loginAction.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange (event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    var form = this.state.form
    form[name] = value
    this.setState({
      form: form
    })
  }

  catchMfaError (err) {
    let mfa = err.split('::')
    if (mfa[0] === 'MFA') {
      const message = mfa[1] || ''
      const type = message.split(':')[0] || ''
      const error = message.split(':')[1] || ''
      this.state.form.otp = ''
      this.setState({form: this.state.form})
      return {error, type}
    }
    return null
  }

  loginAction (event) {
    if (event) event.preventDefault()
    if (!this.state.form.login || !this.state.form.password) return
    FpAuthentication.standardLogin(this.state.form)
      .then((message) => {
        FpToaster.success(message)
      })
      .catch((err) => {
        let catchMfa = this.catchMfaError(err)
        if (catchMfa && catchMfa.type) {
          let type = catchMfa.type.toLowerCase()
          let component = Mfa[type] || FpSdk.getModule(type)
          if (!component) {
            this.setState({mfa: null})
            return FpToaster.error(FpTranslate('AuthenticationMfaNotFound', [type]))
          }
          return this.setState({mfa: {options: catchMfa, component: component}})
        }
        if (err.indexOf('MFA:BAD_OTP') !== -1 || err.indexOf('InvalidOTP') !== -1) {
          this.state.form.otp = ''
          this.setState({form: this.state.form})
          return FpToaster.error(FpTranslate('fp.clientAuthorityManager.mfa.otp.error', [this.state.mfa.options.type]))
        }
        FpToaster.error(err)
      })
  }

  renderMfa () {
    let Component = React.createElement(this.state.mfa.component, {
      onClose: _ => {
        this.state.form.otp = ''
        this.setState({mfa: null, form: this.state.form})
      },
      onChange: (e) => {
        let value = e.target.value
        this.state.form.otp = value
        this.setState({form: this.state.form})
      },
      onSubmit: (e) => this.loginAction(e),
      type: this.state.mfa.options.error,
      user: this.state.form,
      preferences: this.props.preferences
    })
    return (
      <div className='client-authority-manager-mfa'>
        <h3 className='mfa-title'>{FpTranslate('fp.clientAuthorityManager.mfa.title', [this.state.mfa.options.type])}</h3>
        {Component}
      </div>
    )
  }

  renderLoginForm () {
    return (
      <div className='standard-login'>
        <form className='login-screen' onSubmit={this.loginAction}>
          <label style={{ color: this.state.color }}>{FpTranslate('Username')}</label>
          <input placeholder={FpTranslate('Your username')} type='text' value={this.state.form.login} onChange={this.handleInputChange} name='login' />
          <br />
          <label style={{ color: this.state.color }}>{FpTranslate('Password')}</label>
          <input placeholder={FpTranslate('Your password')} type='password' value={this.state.form.password} onChange={this.handleInputChange} name='password' />
          <br />
          <div className='login-actions-container'>
            <div className='login-action-container send-container'>
              <button className='btn-login btn btn-primary' style={{ backgroundColor: this.state.color }} type='submit'>{FpTranslate('signin')}</button>
            </div>
            <div className='login-action-container return-container'>
              <div className='forgot-password-link-container'>
                <a onClick={() => this.setState({forgotPassword: true})} className='forgot-password-link'>{FpTranslate('Forgot password')}</a>
              </div>
              {this.state.return &&
                <button className='btn return-button' type='button' onClick={this.props.close}>{FpTranslate('Return')}</button>
              }
            </div>
          </div>
        </form>
      </div>
    )
  }

  render () {
    if (this.props.preferences) {
      if (this.state.forgotPassword) {
        return <FpPasswordForgot close={() => this.setState({forgotPassword: false})} color={this.state.color} />
      }
      if (this.state.mfa) {
        return this.renderMfa()
      }
      return this.renderLoginForm()
    }
    return <FpLoader />
  }
}

FpClientAuthorityManager.propTypes = {
  auth_mode: PropTypes.shape({
    _id: PropTypes.string
  }),
  preferences: PropTypes.object,
  close: PropTypes.func
}

export default FpClientAuthorityManager
