import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import FpSdk from 'forepaas/sdk'
import FpToaster from 'forepaas/toaster'
import LocalActions from 'forepaas/store/local/action'
import QueryStringAction from 'forepaas/store/querystring/action'
import SessionActions from 'forepaas/store/session/action'

var FpMenuLoader, FpDashboardLoader, FpLoginSelector, FpPasswordChange, FpGoogleAnalytics

class FpAppTemplate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: !FpSdk.config.authentication
    }
    this.reload = this.reload.bind(this)
    this.modules = FpSdk.modules
    if (FpSdk.modules.menu) {
      FpMenuLoader = FpSdk.modules.menu.FpMenuLoader
    }

    if (FpSdk.modules.dashboarding) {
      FpDashboardLoader = FpSdk.modules.dashboarding.FpDashboardLoader
    }

    if (FpSdk.modules['client-authority-manager']) {
      FpLoginSelector = FpSdk.modules['client-authority-manager'].FpLoginSelector
      FpPasswordChange = FpSdk.modules['client-authority-manager'].FpPasswordChange
    }
    if (FpSdk.modules['google-analytics']) {
      FpGoogleAnalytics = FpSdk.modules['google-analytics']
      FpGoogleAnalytics.init()
    }
  }

  componentWillMount () {
    FpSdk.modules.store.subscribe(this.reload)
    // Init all store except memory
    FpSdk.modules.store.dispatch(LocalActions.initAll())
    FpSdk.modules.store.dispatch(SessionActions.initAll())
    FpSdk.modules.store.dispatch(QueryStringAction.initAll())
  }

  reload () {
    let cam = FpSdk.modules.store.getState().local['client-authority-manager-session']
    this.setState({
      passwordRenew: cam && cam.password_renew,
      isAuthenticated: !FpSdk.config.authentication || (cam && cam.token)
    })
  }

  renderApp () {
    return (
      <HashRouter>
        <div className='view'>
          {this.modules.menu && FpSdk.config.menu &&
            <FpMenuLoader />
          }
          {this.modules.dashboarding && !this.state.passwordRenew &&
            <div className='page'>
              <FpDashboardLoader />
            </div>
          }
        </div>
      </HashRouter>
    )
  }

  renderLogin () {
    return <FpLoginSelector />
  }

  renderPasswordChange () {
    return <FpPasswordChange />
  }

  render () {
    let content, store, Toaster
    store = FpSdk.modules.store
    if (this.state.passwordRenew || FpSdk.config.forcePasswordChange) {
      content = this.renderPasswordChange()
    } else if (this.state.isAuthenticated) {
      content = this.renderApp()
    } else {
      content = this.renderLogin()
    }
    Toaster = FpToaster.render()
    let rootClassName = 'root-container ' + (this.state.isAuthenticated ? 'logged' : 'not-logged')
    return (
      <Provider store={store}>
        <div className={rootClassName}>
          {content}
          <Toaster />
        </div>
      </Provider>
    )
  }
}

export default FpAppTemplate
