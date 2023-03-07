import React from 'react'
import PropTypes from 'prop-types'

import FpTranslate from 'forepaas/translate'

class FpPasswordPolicies extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      policies: []
    }
    this.atLeastUppercase.bind(this)
    this.minLength.bind(this)
    this.atLeastNumber.bind(this)
    this.atLeastSpecialChars.bind(this)
    this.initPolicies()
  }

  initPolicies () {
    let mapFunctions = {
      nb_cchar: {
        fn: this.atLeastUppercase,
        text: 'settingsAtLeastUper'
      },
      nb_char: {
        fn: this.minLength,
        text: 'settingsAtLeastCharacter'
      },
      nb_int: {
        fn: this.atLeastNumber,
        text: 'settingsAtLeastNumber'
      },
      nb_schar: {
        fn: this.atLeastSpecialChars,
        text: 'settingsAtLeastSpecialChars'
      }
    }
    Object.keys(this.props.passwordPolicies).forEach((key) => {
      if (mapFunctions[key]) {
        this.state.policies.push({
          check: mapFunctions[key].fn,
          text: FpTranslate(mapFunctions[key].text, [parseInt(this.props.passwordPolicies[key])]),
          number: parseInt(this.props.passwordPolicies[key]),
          parent: this
        })
      }
    })
  }

  componentDidUpdate () {
    let check = true
    this.state.policies.forEach((policy) => {
      if (!policy.check(policy.number)) check = false
    })
    this.props.policiesChange(check)
  }

  minLength (number) {
    return (
      this.parent.props.password &&
      this.parent.props.password.length >= number
    )
  }

  atLeastUppercase (number) {
    return (
      this.parent.props.password &&
      this.parent.countUpperCaseChars(this.parent.props.password) >= number
    )
  }

  atLeastNumber (number) {
    return (
      this.parent.props.password &&
      this.parent.countNumber(this.parent.props.password) >= number
    )
  }

  atLeastSpecialChars (number) {
    return (
      this.parent.props.password &&
      this.parent.countSpecialChars(this.parent.props.password) >= number
    )
  }

  countUpperCaseChars (str) {
    let count = 0
    let len = str.length
    for (let i = 0; i < len; i++) {
      if (/[A-Z]/.test(str.charAt(i))) count++
    }
    return count
  }
  countNumber (str) {
    let count = 0
    let len = str.length
    for (let i = 0; i < len; i++) {
      if (/[0-9]/.test(str.charAt(i))) count++
    }
    return count
  }

  countSpecialChars (str) {
    let specialChars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
    let count = 0
    let len = str.length
    for (let i = 0; i < len; i++) {
      if (specialChars.indexOf(str.charAt(i)) !== -1 && str.charAt(i) !== '') { count++ }
    }
    return count
  }

  renderPolicy (policy, index) {
    let classes = 'fa '
    classes += policy.check(policy.number) ? 'fa-check' : 'fa-remove'
    return (
      <div className='policy' key={index}>
        <p>
          <i className={classes}>&nbsp;</i>
          <span>{policy.text}</span>
        </p>
      </div>
    )
  }
  render () {
    return (
      <div className='policies'>
        {this.state.policies.map((policy, index) =>
          this.renderPolicy(policy, index)
        )}
      </div>
    )
  }
}

FpPasswordPolicies.propTypes = {
  passwordPolicies: PropTypes.object,
  policiesChange: PropTypes.func
}

export default FpPasswordPolicies
