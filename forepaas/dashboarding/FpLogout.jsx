import React from 'react'

import FpSdk from 'forepaas/sdk'

class FpLogout extends React.Component {
  componentWillMount () {
    FpSdk.modules['client-authority-manager'].FpAuthentication.logout()
    window.location.hash = '/'
  }

  render () {
    return null
  }
}

export default FpLogout
