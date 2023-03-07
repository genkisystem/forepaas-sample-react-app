import React from 'react'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'
import FpGridLayout from 'forepaas/core-ui/grid-layout'

class FpDashboard extends React.Component {
  constructor (props) {
    super(props)
    this.style = FpSdk.config.style ? FpSdk.config.style.dashboard : {}
    this.config = FpSdk.config.dashboarding[this.props.match.path]
  }

  componentDidMount () {
    window.scrollTo(0, 0)
    let page = document.getElementsByClassName('page')
    if (page && page.length > 0 && page[0].scrollTo) {
      page[0].scrollTo(0, 0)
    }
    if (FpSdk.modules['google-analytics']) {
      const page = this.props.match.path
      FpSdk.modules['google-analytics'].track(page)
    }
  }

  render () {
    return (
      <div className='fp-dashboard'>
        <FpGridLayout
          dashboardId={this.props.match.path}
          root={this.config}
          items={this.config.items}
          containerPadding={this.config.containerPadding}
          style={this.style}
          margin={this.config.margin}
          customclass={this.config.customclass}
        />
      </div>
    )
  }
}

FpDashboard.propTypes = {
  match: PropTypes.object
}

export default FpDashboard
