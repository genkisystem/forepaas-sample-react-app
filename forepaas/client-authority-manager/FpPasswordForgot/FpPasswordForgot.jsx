import React from 'react'
import PropTypes from 'prop-types'

import FpToaster from 'forepaas/toaster'
import FpTranslate from 'forepaas/translate'
import FpAuthentication from '../FpAuthentication'

class FpPasswordForgot extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      form: {
        email: ''
      }
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange (event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    var form = this.state.form
    form[name] = value
    this.setState({
      form
    })
  }

  canSubmit () {
    return this.state.form.email.length > 0
  }

  handleSubmit (event) {
    event.preventDefault()
    if (this.canSubmit()) {
      FpAuthentication.passwordRenew(this.state.form.email)
        .then((message) => {
          this.setState({
            form: {
              email: ''
            }
          })
          FpToaster.success(message)
        })
        .catch((err) => {
          FpToaster.error(err || FpTranslate('account_not_found'))
        })
    }
  }

  render () {
    return (
      <div className='forgot-password-form'>
        <form className='forgot-screen' onSubmit={this.handleSubmit}>
          <label style={{ color: this.props.color }}>{FpTranslate('Email')}</label>
          <input type='email' placeholder={FpTranslate('Your email')} value={this.state.form.email} onChange={this.handleInputChange} name='email' />
          <br />
          <div className='forgot-password-actions-container'>
            <div className='forgot-password-action-container return-container'>
              <button className='btn btn-primary' onClick={this.props.close}>{FpTranslate('Cancel')}</button>
            </div>
            <div className='forgot-password-action-container send-container'>
              <button className='btn btn-primary' type='submit' style={{ backgroundColor: this.props.color }} disabled={!this.canSubmit()} >{FpTranslate('Send')}</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

FpPasswordForgot.propTypes = {
  close: PropTypes.func,
  color: PropTypes.string
}

export default FpPasswordForgot
