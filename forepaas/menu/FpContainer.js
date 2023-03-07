import Sortable from 'sortablejs'
import { FpArchitectApi } from 'forepaas/sdk/architect'
import './FpContainer.less'

import FpContainerOptions from './FpContainerOptions'

export default class FpContainer {
  /**
   * constructor
   * @param {DOMElement} elem - Grid element in dom
   * @param {object} options - Options of the grid
   * @param {object} options.width - Width of the grid
   * @param {object} options.height - Height of the grid
   * @param {object} options.events - Callback events
   * @param {object} options.events.add - Callback events on add element
   */
  constructor (elem, options) {
    options = options || {}
    this.elem = elem
    if (window.getComputedStyle(this.elem.parentNode).position !== 'absolute') {
      this.elem.parentNode.style.position = 'relative'
    } else {
      this.elem.style.position = 'relative'
    }
    this.lang = options.lang
    this.value = options.value
    this.id = options.id
    this.events = options.events || {}
    this.items = options.items || []
    // Editor mode is configurable, so in production mode
    if (!window.Forepaas.config.server) return this
    FpArchitectApi.components()
      .then(data => {
        this.components = data
        this.containerOptions = new FpContainerOptions(this)
        document.body.appendChild(this.containerOptions.elem)
      })
      .catch(err => console.error(err))
    this.handleSort()
  }

  handleSort () {
    if (!document.getElementById(this.id)) {
      return setTimeout(_ => this.handleSort(), 100)
    }
    Sortable.create(document.getElementById(this.id), {
      group: this.id,
      handle: '.move-handler',
      animation: 100,
      onEnd: (evt) => {
        let idx = this.items.findIndex(it => it && (it.id === evt.item.id || evt.item.firstElementChild.id === it.id))
        if (idx !== -1) {
          this.items.splice(this.getNewIndex(evt.newIndex), 0, this.items.splice(idx, 1)[0])
          let value = Object.assign({}, this.value)
          value.items = this.items.map(it => it.original)
          this.io.emit({
            action: 'update',
            root: this.id,
            id: this.id,
            value
          })
        }
      }
    })
  }

  /**
   * Add a FpContainerItem to the FpContainer
   * It will be call by the view (.jsx,.vue etc..)
   * @param {FpContainerItem} item Item to put in the grid
   */
  add (item) { this.items.push(item) }

  remove (id) {
    let idx = this.items.find(it => it.id === id)
    if (idx !== -1) this.items.splice(idx, 1)
  }
  /**
   * Refresh the container and position of container options
   */
  refresh () { this.containerOptions.setPosition() }
  /**
   * Remove the container options from the DOM
   */
  destroy () {
    document.body.removeChild(this.containerOptions.elem)
  }
  /**
   * Remove and item from FpContainer and refresh FpContainer
   * @param {String} id Item id
   */
  delete (id) {
    this.events.delete(id)
    this.refresh()
  }

  getNewIndex (idx) {
    let plus = 0
    let check = 0
    this.items.forEach(item => {
      if (check === idx) return
      if (!item) plus += 1
      else check += 1
    })
    return idx + plus
  }
}
