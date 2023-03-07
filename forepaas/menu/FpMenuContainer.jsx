import React from 'react'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'

import FpMenuItem from './FpMenuItem.jsx'
import FpContainer from './FpContainer'

class FpMenuContainer extends React.Component {
  constructor (props) {
    super(props)
    this._id = `menu[${props.menuIndex}].containers[${props.index}]`
    this.state = {
      items: props.items,
      container: null
    }
  }

  componentDidMount () {
    this.reload()
    this.setState({container: this.container})
  }

  reload () {
    this.container = new FpContainer(this.refs['container-inner'], {
      containerId: this._id,
      value: this.props.value,
      root: this._id,
      id: this._id,
      lang: FpSdk.modules.store.getState().local.lang || FpSdk.config.lang,
      events: {
        refresh: (items) => {
          this.setState({ items: [] })
          process.nextTick(_ => {
            this.setState({ items })
            FpSdk.updateConfig(this._id, {items})
          })
        },
        add: (item) => {
          this.state.items = this.state.items || []
          this.state.items.push(item)
          this.setState({ items: this.state.items })
          FpSdk.updateConfig(this._id, {items: this.state.items})
        },
        update: (idx, item) => {
          // If you get a better idea tell me
          delete this.state.items[idx]
          this.setState({ items: this.state.items })
          process.nextTick(_ => {
            this.state.items[idx] = item
            this.setState({ items: this.state.items })
            FpSdk.updateConfig(this._id, {items: this.state.items})
          })
        },
        delete: (idx) => {
          // We do this to reassign all unique id to items
          let items = Object.assign([], this.state.items)
          items.splice(idx, 1)
          this.setState({ items: [] })
          process.nextTick(_ => {
            this.setState({ items })
            FpSdk.updateConfig(this._id, {items})
          })
        }
      }
    })
  }

  renderItems () {
    if (!this.state.container) return null
    if (!this.state.items) return null
    return (
      <ul id={this._id} className='menu-lists'>
        {this.state.items.filter(item => item).map((item, index) => {
          return <FpMenuItem
            key={index}
            idx={index}
            item={item}
            menu={this.props.menu}
            container={this.container}
            containerId={this._id}
            ref={(item) => { this[`item_${index}`] = item }}
          />
        })}
      </ul>
    )
  }

  render () {
    let className = ['fp-container']
    if (this.props.class) className.push(this.props.class)
    else className.push(this.props.id)
    return (
      <div className={className.join(' ')} style={this.props.style}>
        <div ref='container-inner' className='container-inner'>
          {this.renderItems()}
        </div>
      </div>
    )
  }
}

FpMenuContainer.propTypes = {
  id: PropTypes.string,
  index: PropTypes.number,
  menuIndex: PropTypes.number,
  class: PropTypes.string,
  items: PropTypes.array.isRequired,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.object,
  menu: PropTypes.object
}

export default FpMenuContainer
