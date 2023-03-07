import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { AnimatedSwitch } from 'react-router-transition'
import ScrollToTop from './ScrollToTop'

import FpSdk from 'forepaas/sdk'
import NotFound from './NotFound.jsx'
import FpLogout from './FpLogout.jsx'

class FpDashboardLoader extends React.Component {
  constructor (props) {
    super(props)
    FpSdk.config.dashboarding = FpSdk.config.dashboarding || {}
    this.state = {}
    if (FpSdk.config.animation && FpSdk.modules.animation) {
      if (!FpSdk.modules.animation.animate[FpSdk.config.animation]) {
        FpSdk.modules.animation.error(FpSdk.config.animation)
      } else {
        this.state.animation = FpSdk.modules.animation.animate[FpSdk.config.animation]
      }
    }
    this.routes = this.initRoutes()
  }

  initRoutes () {
    let routes = Object.keys(FpSdk.config.dashboarding).map((key) => {
      var templateName = FpSdk.config.dashboarding[key].template || 'default'
      var template = FpSdk.modules.dashboarding.templates[templateName]
      if (!template) {
        console.error('Template ' + templateName + ' not found. Switching to default')
        template = FpSdk.modules.dashboarding.templates['default']
      }
      return <Route exact key={key} path={key} component={template} />
    })
    Object.keys(FpSdk.modules).forEach(moduleId => {
      if (FpSdk.modules[moduleId] && FpSdk.modules[moduleId].routes) {
        FpSdk.modules[moduleId].routes().forEach((route) => {
          routes.push(<Route {...route} />)
        })
      }
    })
    if (FpSdk.config.dashboarding) {
      routes.push(<Redirect key='/' to={FpSdk.config.root || Object.keys(FpSdk.config.dashboarding)[0]} />)
    }
    routes.push(<Route key='/logout' path='/logout' component={FpLogout} />)
    routes.push(<Route key='*' path='*' component={NotFound} />)
    return routes
  }

  render () {
    if (this.state.animation) {
      return (
        <ScrollToTop>
          <AnimatedSwitch
            className='animated-switch switch'
            {...this.state.animation.pageTransitions}
            mapStyles={this.state.animation.mapStyles}
          >
            {this.routes}
          </AnimatedSwitch>
        </ScrollToTop>
      )
    } else {
      return (
        <ScrollToTop>
          <div className='switch' style={{height: '100%'}}>
            <Switch>
              {this.routes}
            </Switch>
          </div>
        </ScrollToTop>
      )
    }
  }
}

export default FpDashboardLoader
