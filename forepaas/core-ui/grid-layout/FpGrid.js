import { FpArchitectApi } from 'forepaas/sdk/architect'
import './FpGrid.less'
import FpRootGridOptions from './FpRootGridOptions'

export default class FpGrid {
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
    this.dashboardId = options.dashboardId
    this.root = options.root
    this.parent = options.parent
    this.id = options.id
    this.lang = options.lang
    if (this.parent) {
      this.parent.child = this
    }
    this.events = options.events || {}
    this.width = options.width || 12
    this.height = options.height || 12
    this.resizable = (typeof (options.resizable) === 'undefined' && true) || options.resizable
    this.elem = elem
    this.elem.style.position = 'relative'
    this.elem.style.overflow = 'auto'
    this.elem.style.height = '100%'
    this.elem.style.width = '100%'
    this.items = []
    this.rootElem = null
    // Editor mode is configurable, so in production mode
    if (!window.Forepaas.config.server) return this
    // If root, its the dashboard itself, we need to add a + item
    if (!this.parent) {
      FpArchitectApi.components()
        .then(data => {
          this.components = data
          this.rootGridOptions = new FpRootGridOptions(this)
          document.body.appendChild(this.rootGridOptions.elem)
        })
        .catch(err => console.error(err))
    }
  }

  /**
   * Add a FpGridChild to the FpGrid
   * It will be call by the view (.jsx,.vue etc..)
   * @param {FpGridChild} item Item to put in the grid
   */
  add (item) {
    this.items.push(item)
  }

  reset () {
    this.items = []
  }

  /**
   * Remove a FpGridChild to the FpGrid
   * It will be call by the view (.jsx,.vue etc..)
   * @param {FpGridChild} id Item id to remove from the grid
   */
  remove (id) {
    this.items = this.items.filter(item => item.id !== id)
  }
  /**
   * Get the next available position for the item
   * It will compute from the item sizeX and sizeY, an available close position in the grid
   * @param {FpGridChild} item Item to put in the grid
   * @return {object} A description object with the correct position and size (col,row,sizeX,sizeY)
   */

  /**
   * Call this function when grid layout is removed and grid has no parent
   * It will remove the root grid options from body
   */
  delete () {
    if (!this.parent && this.rootGridOptions) {
      document.body.removeChild(this.rootGridOptions.elem)
      this.rootGridOptions.delete()
    }
  }

  getNextPosition (item) {
    item = item || {}
    let height = 0
    this.items.forEach((it) => {
      if (it) {
        height = (it.sizeY + it.row > height && it.sizeY + it.row) || height
      }
    })
    return {
      col: 0,
      row: height,
      sizeX: item.sizeX || (this.width && this.width / 3) || 4,
      sizeY: item.sizeY || (this.height && this.height / 3) || 4
    }
  }
}
