import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

import FpSdk from 'forepaas/sdk'

import FpMenus from './FpMenus'
import FpMenuContainer from './FpMenuContainer.jsx'

/**
 * FpMenuLoader
 */
class FpMenuLoader extends React.Component {
  constructor (props) {
    super(props)
    this.style = FpSdk.config.style ? FpSdk.config.style.menu : {}
    this.state = {
      catchError: null,
      menus: cloneDeep(FpSdk.config.menu)
    }
    this.refresh = this.refresh.bind(this)
  }
  componentWillMount () { FpMenus(this.refresh) }
  refresh (menus) {
    this.setState({ menus: [] })
    process.nextTick(_ => {
      this.setState({ menus })
      // FpSdk.updateConfig('menu', menus)
    })
  }

  if (item) {
    if (item.if) {
      try {
        let func = new Function('FpSdk', item.if)
        if (typeof func === 'function') {
          return func(FpSdk)
        }
      } catch (err) {
        console.error(`There is a problem in your function: ${item.if}`)
        console.error(err)
      }
    }
    return true
  }

  renderMenu (menu, index) {
    if (this.if(menu)) {
      return (
        <div className={menu.class || menu.id} style={menu.style} key={index}>
          <div className='container'>
            {menu.containers.map((container, containerIndex) => <FpMenuContainer
              menu={menu}
              key={containerIndex}
              index={containerIndex}
              menuIndex={index}
              value={container}
              {...container}
            />)}
          </div>
        </div>
      )
    }
    return null
  }

  render () {
    return (
      <div className='menu' style={this.style}>
        {this.state.menus.map((menu, index) =>
          menu && this.renderMenu(menu, index)
        )}
      </div>
    )
  }
}

export default FpMenuLoader
