import React from 'react'
import PropTypes from 'prop-types'

import FpTranslate from 'forepaas/translate'
import FpAuthentication from 'forepaas/client-authority-manager/FpAuthentication'
import FpPasswordPolicies from './FpPasswordPolicies.jsx'

class FpPasswordStrength extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      score: 0,
      entropy: 0,
      isPassword: true,
      isValid: false,
      displayPolicies: false,
      preferences: null
    }
    this.getMeterStyle = this.getMeterStyle.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleZxcvbn = this.handleZxcvbn.bind(this)
    this.handleMinLength = this.handleMinLength.bind(this)
  }

  componentWillMount () {
    // snippet to async load zxcvbn if enabled
    (function () {
      var asyncLoad = () => {
        var first, s
        s = document.createElement('script')
        s.src = this.props.zxcvbn
        s.type = 'text/javascript'
        s.async = true
        first = document.getElementsByTagName('script')[0]
        return first.parentNode.insertBefore(s, first)
      }
      asyncLoad()
    }).call(this)
  }

  handleChange (e) {
    e.preventDefault()
    let val = e.target.value
    this.handleZxcvbn(val)
    this.setState({
      value: val,
      isValid: e.target.validity.valid
    })
    if (this.props.onChange) {
      this.props.onChange(val)
    }
    if (this.props.minLength) {
      this.handleMinLength(e.target.value.length)
    }
  }

  getMeterStyle () {
    let width = this.state.value === '' ? 0 : 24 * this.state.score + 4
    return {
      width: width + '%',
      opacity: width * 0.01 + 0.5
    }
  }

  handleMinLength (len) {
    if (len <= this.props.minLength) {
      this.setState({
        isValid: false
      })
    }
  }

  handleZxcvbn (val) {
    if (typeof zxcvbn === 'undefined' && typeof window.zxcvbn === 'undefined') {
      return
    }
    /* global zxcvbn */
    let stats = zxcvbn(val)
    let currentScore = stats.score
    this.setState({
      score: currentScore,
      entropy: stats.entropy
    })
    if (currentScore < this.props.minScore) {
      this.setState({
        isValid: false
      })
    }
    // if score changed and callback provided
    if (this.props.changeCb && this.state.score !== currentScore) {
      this.props.changeCb(this.state.score, currentScore, val)
    }
    return currentScore
  }

  componentDidMount () {
    FpAuthentication.applicationsPreferences()
      .then((preferences) => {
        this.setState({
          preferences
        })
      })
  }

  displayPolicies = () => {
    this.setState({ displayPolicies: true })
  }

  doNotDisplayPolicies = () => {
    this.setState({ displayPolicies: false })
  }

  getInfoStyle = () => {
    return this.props.policies ? 'success' : 'error'
  }

  setPolicies = (check) => {
    this.props.setPolicies(check)
  }

  render () {
    let infoBar
    const { color } = this.state.preferences || {}

    if (this.props.infoBar && this.state.value.length > 0) {
      infoBar = (
        <div className='password-info'>
          <p className='password-strength'>
            {this.state.value.length > 0 &&
              this.props.strengthLang.length > 0
              ? this.props.strengthLang[this.state.score] : null}
          </p>
          <div className='password-meter-container'>
            <span className={`password-meter ${this.props.strengthClass[this.state.score]}`} style={this.getMeterStyle()} />
          </div>
        </div>
      )
    }

    return (
      <div className='fp-password-strength'>
        <label style={{ color }}><span>{FpTranslate('settingsNewPassword.input')}</span><i className={`fa fa-info-circle ${this.getInfoStyle()}`} onMouseEnter={this.displayPolicies} onMouseLeave={this.doNotDisplayPolicies} /></label>
        <input
          ref={this.props.id}
          className='password-input'
          type={this.state.isPassword ? 'password' : 'text'}
          value={this.state.value}
          onChange={this.handleChange}
          placeholder={FpTranslate('settingsNewPassword.input_your')}
        />
        {infoBar}
        {this.state.preferences &&
          <div className='password-policies' style={{ display: `${this.state.displayPolicies ? 'block' : 'none'}` }}>
            <h3>{FpTranslate('settingsPasswordMustContain')}</h3>
            <FpPasswordPolicies
              passwordPolicies={this.state.preferences.password_policies}
              password={this.state.value}
              policiesChange={this.setPolicies}
            />
          </div>
        }
      </div>
    )
  }
}

FpPasswordStrength.propTypes = {
  zxcvbn: PropTypes.string,
  changeCb: PropTypes.func,
  infoBar: PropTypes.bool,
  minScore: PropTypes.number,
  onChange: PropTypes.func,
  minLength: PropTypes.number,
  strengthLang: PropTypes.array,
  strengthClass: PropTypes.array,
  id: PropTypes.string,
  setPolicies: PropTypes.func,
  policies: PropTypes.bool
}

FpPasswordStrength.defaultProps = {
  infoBar: true,
  statusColor: '#5CE592',
  statusInactiveColor: '#FC6F6F',
  zxcvbn: 'https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/1.0/zxcvbn.min.js',
  minScore: 0,
  strengthLang: ['Weak', 'Okay', 'Good', 'Strong', 'Great'],
  strengthClass: ['weak', 'okay', 'good', 'strong', 'great'],
  id: 'input'
}

export default FpPasswordStrength
