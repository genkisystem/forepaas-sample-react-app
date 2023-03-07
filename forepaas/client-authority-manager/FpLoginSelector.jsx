import React from 'react'
import PropTypes from 'prop-types'

import FpLoader from 'forepaas/core-ui/loader'
import FpToaster from 'forepaas/toaster'
import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import {del} from 'forepaas/store/local/action'

import FpHeaderLogin from './FpHeaderLogin.jsx'
import FpAuthentication from './FpAuthentication'
import FpClientAuthorityManagerError from './FpClientAuthorityManagerError.jsx'
import loginImage from './assets/login.png'
import forepaasLogo from './assets/logo.png'
import forepaasFullLogo from './assets/logofull.png'
import dots from './assets/dots.png'

class FpLoginSelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: null,
      preferences: null,
      error: null,
      notResolved: null,
      configuration: {}
    }
  }

  get logoutState () {
    let cam = FpSdk.modules.store.getState().local['client-authority-manager-session']
    return cam && cam.logout
  }

  componentDidMount () {
    FpAuthentication.errorLogin()
      .then(_ => {
        return FpAuthentication.replyLogin()
      })
      .then((message) => {
        if (message) {
          FpToaster.success(message)
        } else {
          this.loadPreferences()
        }
      })
      .catch((error) => {
        this.loadPreferences(error)
      })
  }

  getAuthModeId () {
    try {
      let params = document.location.hash.split('?')[1].split('&')
      for (let p in params) {
        params[p] = params[p].split('=')
        if (params[p][0] === 'auth_mode_id') return params[p][1]
      }
    } catch (_) {
      return null
    }
  }

  loadPreferences (error) {
    FpAuthentication.applicationsPreferences()
      .then((preferences) => {
        let authModes = preferences.auth_mode || []
        authModes = authModes.filter(auth => (typeof auth.visible === 'undefined' || auth.visible) && auth.type !== 'mfa')
        let aid = this.getAuthModeId()
        if (!aid) {
          authModes = authModes.filter(auth => !auth.hidden)
        }
        this.setState({
          error,
          preferences,
          auth_modes: authModes
        })
        if (this.state.error) {
          console.error(this.state.error)
          this.getConfiguration(preferences)
          return
        }
        if (authModes.length === 1 && !this.logoutState) {
          this.selectAuthMode(authModes[0])
        } else if (aid) {
          this.selectAuthMode(authModes.find(am => am._id === aid || am.provider === aid || am.subtype === aid))
        }
        this.getConfiguration(preferences)
      })
      .catch((err) => {
        FpToaster.error(err.message)
        this.setState({ notResolved: `${err.message}. Consider changing your authentication url: ${FpSdk.config.authentication}` })
      })
  }

  getConfiguration (preferences) {
    const { background, name, title, message, logo, color } = preferences || {}
    let image = loginImage
    let displayCustomImage = false
    if (background) {
      image = background
      displayCustomImage = true
    }
    const displayLogo = logo || forepaasLogo
    const displayTitle = title || name
    const displayDescription = message
    const displayColor = color || '#00CCF9'

    this.setState({
      configuration: {
        image,
        displayCustomImage,
        displayLogo,
        displayTitle,
        displayDescription,
        displayColor
      }
    })
  }

  selectAuthMode (authMode) {
    var screen = authMode.open({
      close: this.returnToSelector.bind(this),
      preferences: this.state.preferences,
      auth_mode: authMode
    })
    this.setState({
      screen: screen
    })
  }

  returnToSelector () {
    this.setState({
      screen: null
    })
  }

  retry () {
    this.setState({
      error: null
    })

    if (this.state.auth_modes.length === 1 && !this.logoutState) {
      this.selectAuthMode(this.state.auth_modes[0])
    }
  }

  getErrorComponent (error) {
    let errorComponent = FpClientAuthorityManagerError
    if (FpSdk.modules['client-authority-manager-error']) {
      errorComponent = FpSdk.modules['client-authority-manager-error']
    }

    return React.createElement(errorComponent, {
      error: error,
      preferences: this.state.preferences,
      configuration: this.state.configuration,
      retry: () => {
        this.retry()
      }
    })
  }

  redirectToLogin = () => {
    FpSdk.modules.store.dispatch(del('client-authority-manager-session'))
    if (this.state.auth_modes.length === 1) {
      this.selectAuthMode(this.state.auth_modes[0])
    }
  }

  renderLogoutPage () {
    return (
      <div className={`fp-client-authority-manager-container ${this.state.configuration.displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={this.state.configuration.image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager signout'>
          <FpHeaderLogin
            title={FpTranslate('You successfully signed out')}
            text={FpTranslate('It is recommended to now close all browser windows before leaving. You can also sign back in by clicking the button below.')}
            logo={forepaasFullLogo}
            dots={dots}
          />
          <div className='fp-logout'>
            <button className='btn reconnect-button' type='button' onClick={this.redirectToLogin}>{FpTranslate('Sign back in')}</button>
          </div>
        </div>
      </div>
    )
  }

  renderNotResolved () {
    return (
      <div className={`fp-client-authority-manager-container ${this.state.configuration.displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={this.state.configuration.image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager'>
          <FpHeaderLogin
            text={this.state.configuration.displayDescription}
            title={this.state.configuration.displayTitle}
            logo={this.state.configuration.displayLogo}
          />
          <p style={{color: 'red'}}>{this.state.notResolved}</p>
        </div>
      </div>
    )
  }

  renderScreen () {
    return (
      <div className={`fp-client-authority-manager-container ${this.state.configuration.displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={this.state.configuration.image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager'>
          <FpHeaderLogin
            text={this.state.configuration.displayDescription}
            title={this.state.configuration.displayTitle}
            logo={this.state.configuration.displayLogo}
          />
          {this.state.screen}
        </div>
      </div>
    )
  }

  renderAuthModes () {
    return (
      <div className={`fp-client-authority-manager-container ${this.state.configuration.displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={this.state.configuration.image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager'>
          <FpHeaderLogin
            text={this.state.configuration.displayDescription}
            title={this.state.configuration.displayTitle}
            logo={this.state.configuration.displayLogo}
          />
          <div className='auth-modes'>
            {this.state.auth_modes.map((authMode, idx) => (
              <div key={idx} className='auth-mode' onClick={() => this.selectAuthMode(authMode)}>
                <img src={authMode.icon} alt='auth-mode-icon' />
                <span className='auth-mode-name'>{FpTranslate(authMode.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  render () {
    if (this.logoutState) return this.renderLogoutPage()
    if (this.state.notResolved) return this.renderNotResolved()
    if (this.state.error) return this.getErrorComponent(this.state.error)
    if (this.state.screen) return this.renderScreen()
    if (this.state.preferences && this.state.auth_modes && this.state.auth_modes.length > 1) return this.renderAuthModes()

    return <FpLoader />
  }
}

export default FpLoginSelector
