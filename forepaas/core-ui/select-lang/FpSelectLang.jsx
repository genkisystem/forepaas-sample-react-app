import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import {connect} from 'react-redux'
import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import {set} from 'forepaas/store/local/action'
import './flags.less'

@connect((state) => ({
  local: state.local
}))

/**
 * Shows the select lang component
 */
export default class SelectLang extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.local - Redux local store
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.state = this.state || {}
    this.state.options = Object.keys(FpSdk.config.i18n).map((lang) => {
      return {
        value: lang,
        label: (
          <div className='elem'>
            { this.props.showLabel &&
              <span>{FpTranslate('lang-label-' + lang)}</span>
            }
            <div className={`flag ${lang}`} />
          </div>
        ),
        class: lang
      }
    })
    this.state.value = this.state.options.find(opt => {
      return opt.value === (this.props.local.lang || FpSdk.config.lang)
    })
    this.handleChange = this.handleChange.bind(this)
  }

  /**
   * Handles the change of the lang
   */
  handleChange (option) {
    if (this.state.value !== option.value) {
      FpSdk.modules.store.dispatch(set('lang', option.value))
      this.setState({value: option.value})
      window.location.reload()
    }
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = ['select-lang', 'selectbox']
    if (this.props.customclass) className.push(this.props.customclass)
    return (
      <div style={this.props.style} className={className.join(' ')}>
        <Select
          options={this.state.options}
          classNamePrefix={'select-lang'}
          value={this.state.value}
          onChange={this.handleChange}
          name='lang'
          id='lang'
        />
      </div>
    )
  }
}

SelectLang.propTypes = {
  local: PropTypes.shape({
    lang: PropTypes.string
  }),
  customclass: PropTypes.string,
  style: PropTypes.object,
  showLabel: PropTypes.bool
}
