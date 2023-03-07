import React from 'react'
import FpGridLayout from 'forepaas/core-ui/grid-layout'
import PropTypes from 'prop-types'

/**
 * Renders a panel
 */
export default class FpPanel extends React.Component {
  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return (
      <div className='fp-core-ui-panel' style={this.props.style}>
        <FpGridLayout {...this.props} />
      </div>
    )
  }
}

FpPanel.propTypes = {
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
