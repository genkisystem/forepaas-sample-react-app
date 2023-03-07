import React from 'react'
import {connect} from 'react-redux'
import FpSdk from 'forepaas/sdk'
import {set} from 'forepaas/store/memory/action'
import Spinner from './spinner'
import SomethingBlue from './something-blue'
import PropTypes from 'prop-types'

@connect((state) => ({
  memory: state.memory
}))

/**
 * Renders a loader
*/
export default class FpLoader extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Array} props.memory - ?
   * @param {func} props.dispatch - Function to dispatch
   */
  constructor (props) {
    super(props)
    this.style = {
      width: '100%',
      height: '100%'
    }
    this.state = {}
    if (FpSdk.config.loader) {
      this.initComponent()
    }
  }

  /**
   * Inits the component
   * This is called in the constructor
  */
  initComponent () {
    if (FpSdk.modules['loader-' + FpSdk.config.loader]) {
      this.state.component = React.createElement(FpSdk.modules['loader-' + FpSdk.config.loader], this.props)
    } else {
      try {
        switch (FpSdk.config.loader) {
          case 'spinner':
            this.state.component = React.createElement(Spinner, this.props)
          case 'something-blue':
            this.state.component = React.createElement(SomethingBlue, this.props)
          default:
            this.state.component = React.createElement(Spinner, this.props)
        }
      } catch (err) {
        this.showError()
        this.state.component = React.createElement(Spinner, this.props)
      }
    }
  }

  /**
   * Shows an error
   */
  showError () {
    if (!this.props.memory['error-loader']) {
      let error = `Loader ${FpSdk.config.loader} is not installed.\nSwitching to default loader : spinner.\n`
      error += `You can choose from :\n\t"spinner"\n\t"spinner"`
      console.error(error)
      this.props.dispatch(set(`error-loader`, true))
    }
  }

  /**
   * renders
   * @return {ReactElement} markup
   */
  render () {
    if (this.state.component) {
      return this.state.component
    }
    return (
      <div style={this.style} >Loading...</div>
    )
  }
}

FpLoader.propTypes = {
  memory: PropTypes.array,
  dispatch: PropTypes.func
}
