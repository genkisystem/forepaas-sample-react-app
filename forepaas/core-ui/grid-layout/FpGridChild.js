import interact from 'interactjs'
import FpChildGridOptions from './FpChildGridOptions'
import FpChildGridCursor from './FpChildGridCursor'
import { FpArchitectServer, FpArchitectApi } from 'forepaas/sdk/architect'
import FpSdk from 'forepaas/sdk'
import cloneDeep from 'lodash/cloneDeep'

export default class FpGridChild {
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
    this.lang = (this.parent && this.parent.lang) || options.lang
    this.elem = options.element
    this.dashboardId = options.dashboardId
    this.root = options.root
    this.original = cloneDeep(options.original)
    this.idx = options.idx
    this.id = options.id
    this.col = this.original.col
    this.row = this.original.row
    this.sizeX = this.original.sizeX
    this.sizeY = this.original.sizeY
    this.child = null
    this.oldTop = null
    this.mousePosition = null
    this.oldMousePosition = null
    this.slow = 0
    // If the element have no position or size, we get it from the nextPosition
    if (isNaN(this.sizeX) || isNaN(this.sizeY) || isNaN(this.row) || isNaN(this.col)) {
      let pos = this.parent.getNextPosition(this)
      this.col = pos.col
      this.row = pos.row
      this.sizeX = pos.sizeX
      this.sizeY = pos.sizeY
    }

    // Not draggable mode (tabs for example)
    if (this.parent.resizable) {
      // We apply the size on the element
      this.refresh()
      this.elem.style.position = 'absolute'
    } else {
      this.elem.style.width = '100%'
      this.elem.style.height = '100%'
    }

    // Editor mode is configurable, so in production mode
    if (!window.Forepaas.config.server) return

    FpArchitectServer()
      .then(io => {
        this.io = io
        return FpArchitectApi.components()
      })
      .then(data => {
        this.components = data
        this.io.on({
          action: 'update',
          id: this.id
        }, (value) => {
          Object.assign(this, value)
          if (this.parent.resizable) {
            this.refresh(true)
          }
        })
        // Init
        this.elem.classList.add('fp-edit')
        // Creation of options hover
        this.elem.appendChild(new FpChildGridOptions(this, this.parent.resizable))
        if (this.parent.resizable) {
          // Creation of the cursor for resize
          this.elem.appendChild(new FpChildGridCursor(this, 'right'))
          this.elem.appendChild(new FpChildGridCursor(this, 'bottom'))
          this.elem.appendChild(new FpChildGridCursor(this, 'bottom-right'))

          this.placeholder = document.createElement('div')
          this.placeholder.classList.add('fp-edit-placeholder')
          // If we do it sync, we fail the loop of the parent class (FpGrid)
          process.nextTick(_ => {
            this.parent.elem.insertBefore(this.placeholder, this.elem)
          })
        }
        // Set the interaction (drag and resize)
        interact(this.elem)
          .draggable({
            inertia: true,
            allowFrom: '.move-handler'
          })
          .resizable({
            allowFrom: '.resize-handler',
            // Only resize from right and bottom side
            edges: {
              right: true,
              bottom: true
            }
          })
          .on('dragstart resizestart', _ => {
            this.elem.classList.add('fp-edit-active')
          })
          .on('dragend resizeend', _ => {
            let value = {
              sizeX: this.realSizeX,
              sizeY: this.realSizeY,
              row: this.realRow,
              col: this.realCol
            }
            this.elem.classList.remove('fp-edit-active')
            this.io.emit({
              action: 'update',
              id: this.id,
              root: this.root,
              value
            })
            FpSdk.updateConfig(this.id, value)
            this.oldTop = this.oldTop || parseFloat(this.elem.style.top.replace('px', ''))
            this.oldMousePosition = this.oldMousePosition || parseFloat(window.event.clientY - 100)
          })
          .on('dragmove', (event) => {
            this.row += event.dy * this.parent.height / this.rowHeight
            this.col += event.dx * this.parent.width / this.getContainerWidth
            this.refresh()
            this.refreshScroll()
          })
          .on('resizemove', (event) => {
            this.sizeY = event.rect.height * this.parent.height / this.rowHeight
            this.sizeX = (event.rect.width / this.getContainerWidth) * this.parent.width
            this.refresh()
            this.refreshScroll()
          })
      })
  }

  /**
   * Get the grid width in px
   * @return {number} The parent width in px
   */
  get getContainerWidth () {
    let style = getComputedStyle(this.parent.elem)
    return parseInt(style.width.split('px')[0])
  }

  /**
   * Accessor to the rowHeight, it should be customizable in the next version
   * rowHeight is the height in px for "this.height" size (default to 12)
   * @return {number} rowHeight in px
   */
  get rowHeight () {
    return 400
  }

  /**
   * Get the real sizeX
   * When you resize an element, it will appear like you resize it, this helper is here to give you the sizeX into the grid
   * @return {number} a sizeX parameter between 1 and this.width
   */
  get realSizeX () {
    if (this.sizeX < 1) return 1
    return Math.round(this.sizeX)
  }

  /**
   * Get the real sizeY
   * When you resize an element, it will appear like you resize it, this helper is here to give you the sizeX into the grid
   * @return {number} a sizeY parameter between 1 and infinity
   */
  get realSizeY () {
    if (this.sizeY < 1) return 1
    return Math.round(this.sizeY)
  }

  /**
   * Get the real row
   * When you move an element, it will appear like you move it, this helper is here to give you the row into the grid
   * @return {number} a row parameter between 0 and infinity
   */
  get realRow () {
    if (this.row < 0) return 0
    return Math.round(this.row)
  }

  /**
   * Get the real col
   * When you move an element, it will appear like you move it, this helper is here to give you the col into the grid
   * @return {number} a col parameter between 0 and this.width
   */
  get realCol () {
    if (this.col < 0) return 0
    if (this.col + this.sizeX > this.parent.width) return this.parent.width - this.sizeX
    return Math.round(this.col)
  }

  // scroll page if div's height pass the overflow
  refreshScroll () {
    let page = document.querySelector('.page')
    let panel = this.elem.parentNode
    let panelCheck = !this.elem.parentNode.parentNode.classList.contains('header-panel-dark')
    let top = parseFloat(this.elem.style.top.replace('px', ''))
    let height = parseFloat(this.elem.style.height.replace('px', ''))
    if (!this.oldTop) this.oldTop = top
    if (window.event) {
      this.mousePosition = parseFloat(window.event.clientY - 100)
      if (!this.oldMousePosition) this.oldMousePosition = this.mousePosition
    } else {
      // if there is not event remove placeholder
      this.placeholder.style.display = 'none'
    }
    let pageHeight = parseInt(page.getBoundingClientRect().height)
    let panelHeight = parseInt(panel.getBoundingClientRect().height)
    let dragUp = this.mousePosition < 50 && (top !== this.oldTop && this.mousePosition <= this.oldMousePosition)
    let dragDown = this.mousePosition + height + 100 > pageHeight
    let dragDownPanel = this.mousePosition + height + 100 > panelHeight
    let bottomScroll = top + height + 40 > page.scrollHeight
    let bottomScrollPanel = top + height + 40 > panel.scrollHeight
    let scrollDown = top === this.oldTop && this.mousePosition > this.oldMousePosition
    let scrollUp = top === this.oldTop && this.mousePosition < this.oldMousePosition && top + height + 100 > page.scrollTop
    let scrollUpPanel = top === this.oldTop && this.mousePosition < this.oldMousePosition && top + height + 100 > panel.scrollTop
    let diffMousePosition = this.mousePosition - this.oldMousePosition > 2 ? 1 : this.mousePosition - this.oldMousePosition

    if (panelCheck) {
      if (dragUp) {
        page.scrollTop = top - 50
      } else if (bottomScroll) {
        // going down when scroll is at the bottom of the page
        page.scrollTop = page.scrollTop + height
      } else if (scrollDown) {
        // going down when scroll
        if (this.mousePosition - this.oldMousePosition > 2 && this.mousePosition - this.oldMousePosition < 150) {
          // scrollTop if scroll and drop to the bottom
          page.scrollTop = page.scrollTop + 1.011 * (this.mousePosition - this.oldMousePosition)
        } else {
          // scrollTop in normal scroll to the bottom
          page.scrollTop = page.scrollTop + 2 * diffMousePosition
        }
      } else if (scrollUp) {
        // going up when scroll
        if (this.oldMousePosition - this.mousePosition > 2 && this.oldMousePosition - this.mousePosition < 120) {
          // scrollTop if scroll and drop to the top
          page.scrollTop = page.scrollTop - 1.009 * (this.oldMousePosition - this.mousePosition)
        } else {
          // scrollTop in normal scroll to the top
          page.scrollTop = page.scrollTop + 0.014 * diffMousePosition
        }
      } else if (dragDown) {
        // adding slower in order to avoid lag when the dashboard if full of elements
        // if (this.slow === 0) {
        page.scrollTop = page.scrollTop + 1.2 * (top - this.oldTop)
        // }
        // if (this.slow === 3) {
        //   this.slow = -1
        // }
        // this.slow++
      }
    } else {
      if (dragUp) {
        panel.scrollTop = top - 50
      } else if (bottomScrollPanel) {
        // going down when scroll is at the bottom of the page
        panel.scrollTop = panel.scrollTop + height
      } else if (scrollDown) {
        // going down when scroll
        if (this.mousePosition - this.oldMousePosition > 2 && this.mousePosition - this.oldMousePosition < 150) {
          // scrollTop if scroll and drop to the bottom
          panel.scrollTop = panel.scrollTop + 1.011 * (this.mousePosition - this.oldMousePosition)
        } else {
          // scrollTop in normal scroll to the bottom
          panel.scrollTop = panel.scrollTop + 1.7 * diffMousePosition
        }
      } else if (scrollUpPanel) {
        // going up when scroll
        if (this.oldMousePosition - this.mousePosition > 2 && this.oldMousePosition - this.mousePosition < 120) {
          // scrollTop if scroll and drop to the top
          panel.scrollTop = panel.scrollTop - 1.009 * (this.oldMousePosition - this.mousePosition)
        } else {
          // scrollTop in normal scroll to the top
          panel.scrollTop = panel.scrollTop + 0.014 * diffMousePosition
        }
      } else if (dragDownPanel) {
        // adding slower in order to avoid lag when the dashboard if full of elements
        // if (this.slow === 0) {
        panel.scrollTop = panel.scrollTop + 1.2 * (top - this.oldTop)
        // }
        // if (this.slow === 3) {
        //   this.slow = -1
        // }
        // this.slow++
      }
    }

    this.oldTop = top
    this.oldMousePosition = this.mousePosition
  }

  /**
   * Refresh the position/size of the element
   * When you drag,resize an element, this method will move/resize it in css
   * @param {boolean} end If set to true, it will use real helper
   * @return {number} a sizeY parameter between 1 and infinity
   */
  refresh (end) {
    // Doing the css update

    if (this.elem) {
      this.elem.style.width = this.sizeX / this.parent.width * 100 + '%'
      this.elem.style.height = this.sizeY / this.parent.height * this.rowHeight + 'px'
      this.elem.style.left = this.col / this.parent.width * 100 + '%'
      this.elem.style.top = this.row / this.parent.height * this.rowHeight + 'px'
    }

    // We always put the placeholder to the real position into the grid
    if (this.placeholder) {
      this.placeholder.style.display = 'block'
      this.placeholder.style.position = 'absolute'
      this.placeholder.style.width = this.realSizeX / this.parent.width * 100 + '%'
      this.placeholder.style.height = this.realSizeY / this.parent.height * this.rowHeight + 'px'
      this.placeholder.style.left = this.realCol / this.parent.width * 100 + '%'
      this.placeholder.style.top = this.realRow / this.parent.height * this.rowHeight + 'px'
      if (end) {
        this.placeholder.style.display = 'none'
      }
    }
    // We trigger a resize event, it will update all the library inside our grid
    var event = document.createEvent('HTMLEvents')
    event.initEvent('resize', true, false)
    window.dispatchEvent(event)
  }
}
