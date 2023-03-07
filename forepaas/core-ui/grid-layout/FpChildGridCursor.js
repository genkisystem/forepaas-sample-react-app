export default class FpChildGridCursor {
  /**
   * constructor
   * FpChildGridCursor is the definition of each resize cursor
   * @param {FpChildGrid} item - FpChildGrid item to update
   * @param {string} side - Side (enum : right,bottom,bottom-right)
   * @return {DOMElement} DomElement to add
   */
  constructor (item, side) {
    let cursor = document.createElement('div')
    cursor.classList.add('fp-architect-tool')
    cursor.classList.add(side)
    cursor.classList.add('fp-edit-cursor')
    cursor.classList.add('resize-handler')

    // Two icons set, one for default, and one for hover
    let icon = document.createElement('i')
    icon.classList.add('icon')
    cursor.appendChild(icon)

    let iconHover = document.createElement('i')
    iconHover.classList.add('icon-hover')
    iconHover.classList.add('fpui')
    switch (side) {
      case 'right':
        iconHover.classList.add('fpui-resize-horizontal')
        break
      case 'bottom':
        iconHover.classList.add('fpui-resize-vertical')
        break
      case 'bottom-right':
        iconHover.classList.add('fpui-expand-left')
        break
    }
    cursor.appendChild(iconHover)

    return cursor
  }
}
