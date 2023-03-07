import React from 'react'

import FpLoader from 'forepaas/core-ui/loader'
import FpTranslate from 'forepaas/translate'

import FpPasswordChangeForm from './FpPasswordChangeForm.jsx'
import FpHeaderLogin from '../FpHeaderLogin.jsx'
import FpAuthentication from '../FpAuthentication'
import loginImage from '../assets/login.png'
import forepaasLogo from '../assets/logo.png'

class FpPasswordChange extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      preferences: null,
      newPassword: '',
      policies: false
    }
    this.passwordChange = this.passwordChange.bind(this)
    this.setPolicies = this.setPolicies.bind(this)
  }

  componentDidMount () {
    FpAuthentication.applicationsPreferences()
      .then((preferences) => {
        this.setState({
          preferences
        })
      })
  }

  passwordChange (password) {
    this.setState({newPassword: password})
  }

  setPolicies (check) {
    if (check !== this.state.policies) this.setState({policies: check})
  }

  renderPasswordChange () {
    const { background, logo, color } = this.state.preferences || {}
    let image = loginImage
    let displayCustomImage = false
    if (background) {
      image = background
      displayCustomImage = true
    }
    const displayLogo = logo || forepaasLogo
    const displayColor = color || '#00CCF9'
    return (
      <div className={`fp-client-authority-manager-container ${displayCustomImage ? 'mask' : 'no-mask'}`}>
        <div className='fp-client-authority-manager-image'>
          <img src={image} alt='login-img' />
        </div>
        <div className='fp-client-authority-manager'>
          <FpHeaderLogin
            title={FpTranslate('Reset password')}
            logo={displayLogo}
          />
          <div className='fp-password-change'>
            <div className='content-change-password'>
              <div className='row'>
                <div className='col-xs-12 col-md-6'>
                  <FpPasswordChangeForm
                    onChangePassword={this.passwordChange}
                    color={displayColor}
                  />
                </div>
                <div className='clearfix' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render () {
    if (this.state.preferences) { return this.renderPasswordChange() }
    return <FpLoader />
  }
}

export default FpPasswordChange
