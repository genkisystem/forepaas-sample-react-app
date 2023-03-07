import cloneDeep from 'lodash/cloneDeep'
import { FpArchitectServer, FpArchitectApi } from 'forepaas/sdk/architect'
import FpContainerItemOptions from './FpContainerItemOptions'

export default class FpContainerItem {
  /**
   * constructor
   * @param {number} id - Index of the element
   * @param {number} idx - Index of the child in it parent
   * @param {DomElement} elem - Dom element representing the child
   * @param {object} json - Original configuration of the component
   * @param {object} options - Options
   * @param {object} options.events - List of events callback
   * @param {function} options.events.delete - Callback on delete (idx)
   * @param {function} options.events.add - Callback on add (jsonItem)
   */
  constructor (options) {
    // Init of the element
    options = options || {}
    this.events = options.events || {}
    this.parent = options.parent || null
    this.lang = this.parent && this.parent.lang
    this.elem = options.element
    this.containerId = options.containerId
    this.root = options.root
    this.original = cloneDeep(options.original)
    this.idx = options.idx
    this.id = options.id

    // Editor mode is configurable, so in production mode
    if (!window.Forepaas.config.server) return
    FpArchitectServer()
      .then(io => {
        this.io = io
        return FpArchitectApi.components()
      })
      .then(data => {
        this.components = data
        // Init
        this.elem.classList.add('fp-edit-container')
        // Creation of options hover
        this.FpContainerItemOptions = new FpContainerItemOptions(this, this.parent.resizable)
        this.elem.appendChild(this.FpContainerItemOptions.elem)
      })
  }

  /**
   * Refresh the position/size of the element
   * When you drag,resize an element, this method will move/resize it in css
   * @param {boolean} end If set to true, it will use real helper
   * @return {number} a sizeY parameter between 1 and infinity
   */
  refresh (end) {
  }
}
