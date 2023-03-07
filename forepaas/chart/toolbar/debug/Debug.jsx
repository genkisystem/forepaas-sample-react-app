import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FpModal, FpModalBody, FpModalHeader } from 'forepaas/core-ui/modal'

@connect(store => ({
  memory: store.memory
}))
class Debug extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.chart - This is the chart members of {@link FpChart}
   * @param {Object} [props.options] - Various options to define the usage of the export button
   */
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }

  get chartInfo () { return this.props.memory[`chart-debug-${this.id}`] }
  get id () { return this.props.chart && this.props.chart.request && this.props.chart.request.id }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div className='fp-toolbar-debug'>
        <i className='fp fp-ask' onClick={() => this.setState({ show: true })} />
        <FpModal show={this.state.show} onRequestClose={() => this.setState({show: false})}>
          <FpModalHeader onRequestClose={() => this.setState({show: false})}>
            <h3>{this.id}</h3>
          </FpModalHeader>
          <FpModalBody>
            <pre>{JSON.stringify(this.chartInfo, null, 2)}</pre>
          </FpModalBody>
        </FpModal>
      </div>
    )
  }
}

Debug.propTypes = {
  chart: PropTypes.object.isRequired,
  memory: PropTypes.object
}
export default Debug
