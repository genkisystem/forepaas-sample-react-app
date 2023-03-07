import React from 'react'
import PropTypes from 'prop-types'

import FpTranslate from 'forepaas/translate'
import FpToaster from 'forepaas/toaster'
import FpAuthentication from '../FpAuthentication'
import FpPasswordStrength from './FpPasswordStrength.jsx'

class FpPasswordChangeForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      policies: false
    }
    this.changeCallback = this.changeCallback.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.canSubmit = this.canSubmit.bind(this)
  }

  handleSubmit (event) {
    event.preventDefault()
    if (this.canSubmit()) {
      FpAuthentication.passwordChange(this.state.oldPassword, this.state.newPassword)
        .then((message) => {
          FpToaster.success(message)
        })
        .catch((err) => {
          FpToaster.error(err)
        })
    }
  }

  changeCallback (event) {
    let passwordInfo = this.state
    if (event.target && event.target.value) {
      passwordInfo[event.target.name] = event.target.value
      this.setState(passwordInfo)
    } else {
      passwordInfo.newPassword = event
      this.props.onChangePassword(event)
      this.setState(passwordInfo)
    }
  }

  canSubmit () {
    const { newPassword, confirmPassword, policies, oldPassword } = this.state
    return (
      newPassword === confirmPassword && policies && newPassword !== '' && oldPassword !== ''
    )
  }

  getRepeatClass () {
    let repeatClass = ''
    if (this.state.confirmPassword !== '' && this.state.newPassword !== '' &&
      this.state.newPassword !== this.state.confirmPassword) { repeatClass += 'error' } else { repeatClass += 'success' }
    return repeatClass
  }

  getBtnClass () {
    let btnClass = 'btn submit-button'
    if (!this.canSubmit()) btnClass += ' disabled'
    return btnClass
  }

  setPolicies = (check) => {
    if (check !== this.state.policies) this.setState({ policies: check })
  }

  render () {
    let btnClass = this.getBtnClass()
    let repeatClass = this.getRepeatClass()
    return (
      <form className='fp-password-change-form' onSubmit={this.handleSubmit}>
        <div className='form-container'>
          <label style={{ color: this.props.color }}>{FpTranslate('settingsOldPassword')}</label>
          <input onChange={this.changeCallback}
            type='password'
            name='oldPassword'
            placeholder={FpTranslate('settingsOldPassword_your')}
          />
        </div>
        <div className='form-container'>
          <FpPasswordStrength onChange={this.changeCallback} minScore={2} setPolicies={this.setPolicies} policies={this.state.policies} />
        </div>
        <div className='form-container'>
          <label style={{ color: this.props.color }}>{FpTranslate('settingsConfirmNewPassword')}</label>
          <input onChange={this.changeCallback}
            type='password'
            name='confirmPassword'
            placeholder={FpTranslate('settingsConfirmNewPassword_your')}
            className={repeatClass}
          />
          {repeatClass === 'error' && <p className='error-info'>{FpTranslate('settingsPasswordDontMatch')}</p>}
        </div>
        <div className='button-container'>
          <button className={btnClass} type='submit' style={{ backgroundColor: this.props.color }}>
            {FpTranslate('settingsNewPassword.submit')}
          </button>
        </div>
      </form>
    )
  }
}

FpPasswordChangeForm.propTypes = {
  onChangePassword: PropTypes.func,
  policies: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  color: PropTypes.string
}

export default FpPasswordChangeForm
