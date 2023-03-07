import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'

const innerDropdown = item => {
  return `
    ${item.parent.events.add ? `<li class='duplicate-handler'>${FpTranslate('Duplicate')}</li>` : ''}
    ${item.parent.events.delete ? `<li class='delete-handler'>${FpTranslate('Remove')}</li>` : ''}
  `
}

const innerHtml = item => {
  return `
    <div class='fp-edit-options-hover'>
      <div class='fp-edit-options-hover-icons'>
        <i class='handler fpui fpui-move move-handler'></i>
        <i class='handler edit-handler fpui fpui-pencil'></i>
        ${
  item.parent.events && (item.parent.events.add || item.parent.events.delete)
    ? `<i class='handler fpui fpui-dots more-handler'></i>`
    : ''
}
      </div>
    </div>
  `
}

export default class FpChildGridOptions {
  /**
   * constructor
   * @param {FpChildGrid} item - FpChildGrid item to update
   * @return {DOMElement} DomElement to add
   */
  constructor (item, resizable) {
    this.item = item
    this.elem = document.createElement('div')
    this.elem.classList.add('fp-edit-options')
    this.elem.classList.add('fp-architect-tool')

    // Template of the options
    this.elem.classList.add(`fp-edit-options-${item.original.type}`)
    this.elem.innerHTML = innerHtml(item)
    this.addEventListener()
    this.addSocketListener()
  }

  addSocketListener () {
    this.item.io.on(
      {
        action: 'add',
        id: this.item.id
      },
      newItem => {
        if (this.item.child && this.item.child.events) {
          this.item.child.events.add(newItem)
        }
      }
    )

    this.item.io.on(
      {
        action: 'replace',
        id: this.item.id
      },
      newItem => {
        this.item.parent.events.update(this.item.idx, newItem)
      }
    )

    this.item.io.on(
      {
        action: 'delete',
        id: this.item.id
      },
      () => {
        this.item.parent.events.delete(this.item.idx)
      }
    )
  }

  removeSocketListener () {
    this.item.io.remove({ action: 'delete', id: this.item.id })
    this.item.io.remove({ action: 'add', id: this.item.id })
    this.item.io.remove({ action: 'replace', id: this.item.id })
  }

  addEventListener () {
    /** ***** Events Start *******/
    this.elem.onmouseover = _ => {
      if (this.elem.style.zIndex < 12001) this.elem.style.zIndex = 12001
      this.updateOptionsHover(true)
    }
    this.elem.onmouseleave = _ => {
      this.elem.style.zIndex = 12000
      this.updateOptionsHover(false)
    }
    let editOptionsHoverIcons = this.elem.querySelector('.fp-edit-options-hover-icons')
    editOptionsHoverIcons.onmouseover = _ => {
      this.elem.style.zIndex = 14000
    }
    editOptionsHoverIcons.onmouseleave = _ => {
      this.elem.style.zIndex = 12000
    }

    let moreHandler = this.elem.querySelector('.more-handler')
    if (moreHandler) this.initDropdown(moreHandler)

    let editHandler = this.elem.querySelector('.edit-handler')
    if (editHandler) {
      editHandler.onclick = _ => {
        FpSdk.FpArchitectEditor.edit({
          item: this.item.original,
          lang: this.item.lang,
          containerId: this.item.containerId
        }).then(newItem => {
          this.item.io.emit({
            action: 'replace',
            id: this.item.id,
            root: this.item.root,
            value: newItem
          })
        })
      }
    }
  }

  initDropdown (moreHandler) {
    this.dropdown = document.createElement('ul')
    let elements = [this.dropdown, moreHandler]
    elements.forEach(elem => {
      elem.onmouseover = _ => {
        let offset = FpSdk.Utils.offset(moreHandler)
        let bottom = offset.bottom
        let left = offset.left
        if (window.innerHeight - bottom < 200) {
          bottom -= this.dropdown.offsetHeight + offset.height
        }
        if (window.innerWidth - left < 200) {
          left -= this.dropdown.offsetWidth - offset.width
        }
        this.dropdown.style.top = `${bottom}px`
        this.dropdown.style.left = `${left}px`
        moreHandler.style.color = 'white'
        moreHandler.style.backgroundColor = '#10B6E9'
        this.updateOptionsHover(true)
      }
      elem.onmouseleave = _ => {
        this.dropdown.style.top = `-1000px`
        this.dropdown.style.left = `-1000px`
        moreHandler.style.color = '#10B6E9'
        moreHandler.style.backgroundColor = '#E6F8FD'
        this.updateOptionsHover(false)
      }
    })
    this.dropdown.classList.add('fpui-edit-menu-options-dropdown')
    this.dropdown.attributes.id = `dropdown-${this.item.id}`
    this.dropdown.innerHTML = innerDropdown(this.item)
    let deleteHandler = this.dropdown.querySelector('.delete-handler')
    if (deleteHandler) {
      deleteHandler.onclick = _ => {
        document.body.removeChild(this.dropdown)
        this.item.io.emit({
          action: 'delete',
          root: this.item.root,
          id: this.item.id
        })
      }
    }
    let duplicate = this.dropdown.querySelector('.duplicate-handler')
    if (duplicate) {
      duplicate.onclick = _ => {
        let value = JSON.parse(JSON.stringify(this.item.original))
        if (value.type === 'dynamic-parameter') {
          let randomId = Math.floor(Math.random() * 10000000 + 1)
          value['dynamic-parameter'].id = `${value.type}-${randomId}`
        }
        this.item.io.emit({
          action: 'add',
          id: this.item.parent.id,
          root: this.item.root,
          value: value
        })
      }
    }
    document.body.appendChild(this.dropdown)
  }

  updateOptionsHover (visible = true) {
    let hover = this.elem.querySelector('.fp-edit-options-hover')
    if (hover) {
      if (visible) {
        hover.style.opacity = 1
        hover.style.zIndex = 10000
      } else {
        hover.style.opacity = 0
        hover.style.zIndex = 0
      }
    }
  }
}
