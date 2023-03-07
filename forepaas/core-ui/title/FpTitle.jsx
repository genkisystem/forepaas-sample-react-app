import React from 'react'
import {connect} from 'react-redux'
import FpSdk from 'forepaas/sdk'
import PropTypes from 'prop-types'

@connect((store) => ({
  store: {
    querystring: store.querystring
  }
}))

/**
 * Renders a title
 */
export default class FpTitle extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array<Object>} props['dynamic-parameters'] - Dynamic parameters to add
   * @param {Array} props.formatter - ?
   * @param {Object<Array>} props.store - This is set by the decorator, connect to Redux store
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.state = {
      values: {}
    }
  }

  componentDidMount () {
    this.props.dynamicParameters.forEach(param => {
      this.state.values[param] = this.getValue(param)
      this.setState({values: this.state.values})
      FpSdk.modules.store.subscribeKey(`querystring.${param}`, _ => {
        this.state.values[param] = this.getValue(param)
        this.setState({values: this.state.values})
      })
    })
  }

  /**
   * ?
   * @param {SytheticEvent} param - ?
   */
  getValue (param) {
    if (this.props.formatter[param]) {
      try {
        let func = new Function('FpSdk', 'value', this.props.formatter[param])
        return func(FpSdk, this.props.store.querystring[param])
      } catch (err) { console.error(err) }
    }
    return this.props.store.querystring[param]
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = ['fp-title']
    if (this.props.customclass) className.push(className)
    return (
      <div style={this.props.style} className={className.join(' ')}>
        <div className='fp-title-block'>
          { Object.keys(this.state.values).map((key, index) => {
            if (this.state.values[key]) {
              let className = ['fp-title-block-value', `fp-title-block-value-${key}`]
              return (
                <div className={className.join(' ')} key={key}>
                  <span>{this.state.values[key]}</span>
                  { this.props.separator && index !== Object.keys(this.state.values).length - 1 && (
                    <div className='fp-title-separator' dangerouslySetInnerHTML={{ __html: this.props.separator }} />
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }
}

FpTitle.propTypes = {
  dynamicParameters: PropTypes.arrayOf(PropTypes.string),
  formatter: PropTypes.object,
  separator: PropTypes.string,
  store: PropTypes.objectOf(PropTypes.array),
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

FpTitle.defaultProps = {
  formatter: {},
  dynamicParameters: []
}
