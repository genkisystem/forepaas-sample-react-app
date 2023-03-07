import FpSdk from 'forepaas/sdk'
import { FpArchitectServer } from 'forepaas/sdk/architect'

const componentByType = (components, type, ret) => {
  if (ret) return ret
  for (let i in components) {
    let component = components[i]
    if (component.type === 'dropdown') {
      ret = componentByType(component.items, type, ret)
    } else {
      if (component.id === type) {
        ret = component
        break
      }
    }
  }
  return ret
}

const componentsList = (components, index) => {
  return components.map(comp => {
    if (comp.name === 'Containers') return null
    if (comp.type === 'dropdown') {
      return `
      <li id='${comp.id}-${index}' class='fpui-edit-component-dropdown'>
        <span>${comp.name}</span>
        <i class="dropdown-closed fp fp-chevron-up"></i>
        <i class="dropdown-open fp fp-chevron-down"></i>
        <ul class="dropdown-component-list">
          ${componentsList(comp.items, index + 1)}
        </ul>
      </li>
      `
    } else {
      return `<li id='${comp.id}'>${comp.name}</li>`
    }
  }).join('\n')
}
const innerHtml = (components) => {
  return `
    <i class='handler fpui fpui-plus add-handler fp-architect-tool'>
      <ul class='fpui-edit-options-dropdown'>
        ${componentsList(components, 0)}
      </ul>
    </i>
  `
}

export default class FpContainerOptions {
  constructor (item) {
    this.item = item
    this.elemParent = item && item.elem
    this.elem = document.createElement('div')
    this.elem.classList.add('fp-container-edit-options')
    // Template of the options
    this.elem.innerHTML = innerHtml(item.components)
    this.onResize = this.onResize.bind(this)
    this.setPosition = this.setPosition.bind(this)
    /** ***** Events Start *******/
    this.addClick()
    this.listener()
    this.setPosition()
    this.addHover()
    this.interval = setInterval(this.setPosition, 500)
    window.addEventListener('resize', this.onResize)
  }
  destroy () {
    window.removeEventListener('resize', this.onResize)
    clearInterval(this.interval)
  }

  onResize () { this.setPosition() }

  addClick () {
    this.elem.querySelectorAll('.add-handler li').forEach(elem => {
      let that = this
      elem.onclick = function (e) {
        e.stopPropagation()
        let type = this.getAttribute('id')
        let component = componentByType(that.item.components, type)
        if (component && component.edit === false) {
          return that.item.io.emit({
            action: 'add',
            id: that.item.id,
            value: { type }
          })
        }
        FpSdk.FpArchitectEditor
          .edit({
            item: {type},
            lang: that.item.lang,
            dashboardId: that.item.dashboardId
          })
          .then((newItem) => {
            that.item.io.emit({
              action: 'add',
              id: that.item.id,
              value: newItem
            })
          })
      }
    })
  }

  addHover () {
    this.elem.onmouseenter = (e) => {
      let container = document.getElementById(this.item.id)
      if (container) {
        container.style.boxShadow = 'inset 0 0 1px 1px red'
      }
    }
    this.elem.onmouseleave = (e) => {
      let container = document.getElementById(this.item.id)
      if (container) {
        container.style.boxShadow = 'none'
      }
    }
  }

  listener () {
    FpArchitectServer()
      .then((io) => {
        this.item.io = io
        this.item.io.on({
          action: 'add',
          id: this.item.id
        }, newItem => {
          this.item.events.add(newItem)
          this.setPosition()
        })
        this.item.io.on({
          action: 'update',
          id: this.item.id
        }, message => {
          this.item.events.refresh(message.items)
          setTimeout(_ => this.setPosition(), 100)
        })
        this.item.io.on({
          action: 'refresh',
          root: this.item.id
        }, message => {
          this.item.events.refresh(message.items)
          // this is to wait for the rerendering
          setTimeout(_ => this.setPosition(), 100)
        })
      })
  }

  setPosition () {
    let offset = FpSdk.Utils.offset(this.elemParent)
    let isVertical = offset.height > offset.width
    let isLeft = offset.left + offset.width / 2 < window.innerWidth / 2
    // adding -50 to fix the issue in the dashboard - not the best solution -
    let isTop = ((offset.top + offset.height / 2) - 50 < window.innerHeight / 2)
    if (isVertical) {
      this.elem.classList.add('vertical')
      this.elem.style.top = `${(offset.height / 2) + offset.top}px`
      this.elem.style.left = `${offset.left + offset.width - 20}px`
    } else {
      this.elem.classList.add('horizontal')
      this.elem.style.top = isTop ? `${offset.bottom - 20}px` : `${offset.top - 20}px`
      this.elem.style.left = `${(offset.width / 2) + offset.left}px`
    }
    if (!isLeft) {
      this.initRightContainer()
    }
    if (!isTop) {
      this.initBottomContainer()
    }
  }

  initBottomContainer () {
    this.elem.classList.add('bottom')
    let dropdown = this.elem.querySelector('.fpui-edit-options-dropdown')
    if (dropdown) {
      dropdown.style.top = `${-((this.item.components.length - 1) * 40)}px`
      let dropdowns = dropdown.querySelectorAll('.fpui-edit-component-dropdown')
      dropdowns.forEach(dp => {
        let id = dp.getAttribute('id')
        let tmp = id.split('-')
        tmp.splice(-1, 1)
        let type = tmp.join('-')
        let comp = this.item.components.find(c => c.id === type && c.name !== 'Containers')
        if (comp) {
          let top = -((comp.items.length - 1) * 40)
          let dpDropdown = dp.querySelector('.dropdown-component-list')
          if (dpDropdown) dpDropdown.style.top = `${top}px`
        }
      })
    }
  }

  initRightContainer () {
    this.elem.classList.add('right')
    let dropdown = this.elem.querySelector('.fpui-edit-options-dropdown')
    if (dropdown) {
      let iconDown = dropdown.querySelector('.dropdown-closed')
      if (iconDown) {
        iconDown.style.right = 'auto'
        iconDown.style.left = '5px'
      }
      let iconOpen = dropdown.querySelector('.dropdown-open')
      if (iconOpen) {
        iconOpen.style.right = 'auto'
        iconOpen.style.left = '5px'
      }
      dropdown.style.left = `${40 - 120}px`
      let dropdowns = dropdown.querySelectorAll('.fpui-edit-component-dropdown')
      dropdowns.forEach(dp => {
        let id = dp.getAttribute('id')
        let tmp = id.split('-')
        let index = tmp[tmp.length - 1]
        let dpDropdown = dp.querySelector('.dropdown-component-list')
        if (dpDropdown) dpDropdown.style.left = `${-120 * (index + 1)}px`
      })
    }
  }
}
