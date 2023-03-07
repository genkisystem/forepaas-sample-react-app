import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'

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

const componentsList = components => {
  return components
    .map(comp => {
      if (comp.type === 'dropdown') {
        return `
      <li id='${comp.id}' class='fpui-edit-component-dropdown'>
        <span>${comp.name}</span>
        <i class="dropdown-closed fp fp-chevron-up"></i>
        <i class="dropdown-open fp fp-chevron-down"></i>
        <ul class="dropdown-component-list">
          ${componentsList(comp.items)}
        </ul>
      </li>
      `
      } else {
        return `<li id='${comp.id}'>${comp.name}</li>`
      }
    })
    .join('\n')
}

const innerHtml = item => {
  return `
    <div class='fp-edit-options-hover'>
      <div class='fp-edit-options-hover-icons'>
          <i class='handler fpui fpui-plus add-handler'>
            <ul class='fpui-edit-options-dropdown'>
              ${componentsList(item.components)}
            </ul>
          </i>
        <i class='handler fpui fpui-move move-handler'></i>
        <div class='handler tooltip-container edit-handler'>
          <i class='handler fpui fpui-pencil'></i>
          <span class='tooltip'>${FpTranslate('Edit')}</span>
        </div>
        ${
  item.parent.events &&
          (item.parent.events.add || item.parent.events.delete)
    ? `
          <i class='handler fpui fpui-dots more-handler'>
            <ul class='fpui-edit-options-dropdown'>
              ${
  item.parent.events.add
    ? `<li class='duplicate-handler'>${FpTranslate(
      'Duplicate'
    )}</li>`
    : ''
}
              ${
  item.parent.events.delete
    ? `<li class='delete-handler'>${FpTranslate('Remove')}</li>`
    : ''
}
            </ul>
          </i>
        `
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
    let options = document.createElement('div')
    options.classList.add('fp-edit-options')
    options.classList.add('fp-architect-tool')
    // Template of the options
    let component = componentByType(item.components, item.original.type)
    options.classList.add(`fp-edit-options-${item.original.type}`)
    // !component is there because if the component is a spec we want to be able to edit in advanced mode
    if (!component || component.edit) options.classList.add('fp-edit-options-editable')
    if (component && component.add) options.classList.add('fp-edit-options-have-child')
    if (resizable) options.classList.add('fp-edit-options-resizable')
    let index = item.idx
    if (item.parent && item.parent.parent && item.parent.parent.original && item.parent.parent.original.type === 'panel') {
      index = `${item.idx}p${item.parent.parent.idx}`
    }
    item.io.on({
      action: 'userEditing',
      dashboardId: item.dashboardId
    },
    data => {
      if (data.length) {
        item.app_name = item.app_name || data[0].app_name
      }
      let indexesBeingEdited = data.map(v => v.indexId)
      // if there is not anyone that edits
      if (!item.userEditing) {
        item.userEditing = []
      }
      indexesBeingEdited.map((v, i) => {
        if (!item.userEditing[i] && !data[i].disconnected) {
          item.userEditing[i] = data[i]
        }
      })
      let textNode = document.createElement('div')
      if (options.parentNode.querySelector(`.fp-edit-options-block-${index}`)) {
        options.parentNode.querySelector(`.fp-edit-options-block-${index}`).style.border = '0px'
      }

      // if user edits
      indexesBeingEdited.map((v, i) => {
        if (!data[i].disconnected) {
          if (item.userEditing[i] && data[i].indexId === index) {
            options.classList.add(`fp-edit-options-block-${index}`)
            if (options.classList.contains(`fp-edit-options-block-${index}`)) {
              textNode.innerHTML = `${item.userEditing[i].userName} is now editing this element`
              textNode.classList.add('user-editing')
              if (options.querySelector('.user-editing')) {
                options.querySelector('.user-editing').remove()
              }
              options.parentNode.querySelector(`.fp-edit-options-block-${index}`).appendChild(textNode)
              options.parentNode.querySelector(`.fp-edit-options-block-${index}`).style.border = '2px solid ' + (item.userEditing[i].color || '#f9f871')
            }
          }
        } else {
          // if the user finished editing or cancelled or left the page
          item.userEditing = item.userEditing.filter(value => { return value.indexId !== v })
          // remove class and red border
          if (options.querySelector('.user-editing')) {
            options.querySelector('.user-editing').remove()
          }
        }
      })

      indexesBeingEdited.map((v, i) => {
        // mouseover
        if (options.parentNode.querySelector(`.fp-edit-options-block-${index}`)) {
          options.parentNode.querySelector(`.fp-edit-options-block-${index}`).onmouseover = _ => {
            if (options.querySelector('.user-editing')) {
              options.querySelector('.user-editing').style.display = 'block'
            }
          }
          // mouseleave
          options.parentNode.querySelector(`.fp-edit-options-block-${index}`).onmouseleave = _ => {
            if (options.querySelector('.user-editing')) {
              options.querySelector('.user-editing').style.display = 'none'
            }
          }
        }
      })
    })
    item.io.emit({
      action: 'loadUsersEditing',
      value: { dashboardId: item.dashboardId }
    })
    options.innerHTML = innerHtml(item)
    /** ***** Events Start *******/
    options.onmouseover = _ => {
      if (options.style.zIndex < 12001) options.style.zIndex = 12001
    }
    options.onmouseleave = _ => {
      options.style.zIndex = 12000
    }
    let editOptionsHoverIcons = options.querySelector(
      '.fp-edit-options-hover-icons'
    )
    editOptionsHoverIcons.onmouseover = _ => {
      options.style.zIndex = 14000
    }
    editOptionsHoverIcons.onmouseleave = _ => {
      options.style.zIndex = 12000
    }
    options.querySelectorAll('.add-handler li').forEach(elem => {
      elem.onclick = function (e) {
        e.stopPropagation()
        let type = this.getAttribute('id')
        let component = componentByType(item.components, type)
        if (component && component.edit === false) {
          return item.io.emit({
            action: 'add',
            id: item.id,
            root: item.root,
            value: { type }
          })
        }
        FpSdk.FpArchitectEditor.edit({
          item: { type },
          lang: item.lang,
          dashboardId: item.dashboardId
        }).then(newItem => {
          item.io.emit({
            action: 'add',
            id: item.id,
            root: item.root,
            value: newItem
          })
        })
      }
    })

    let duplicate = options.querySelector('.duplicate-handler')
    if (duplicate) {
      duplicate.onclick = _ => {
        let value = JSON.parse(JSON.stringify(item.original))
        delete value.col
        delete value.row
        if (value.type === 'dynamic-parameter') {
          let randomId = Math.floor(Math.random() * 10000000 + 1)
          value['dynamic-parameter'].id = `${value.type}-${randomId}`
        }
        item.io.emit({
          action: 'add',
          id: item.parent.id,
          root: item.root,
          value: value
        })
      }
    }

    let editHandler = options.querySelector('.edit-handler')
    if (editHandler) {
      editHandler.onclick = _ => {
        item.original.sizeX = item.sizeX
        item.original.sizeY = item.sizeY
        item.original.col = item.col
        item.original.row = item.row
        if (!item.userEditing) {
          item.userEditing = []
        }
        const indexBeingEdited = item.userEditing.filter(v => v.indexId === index)
        if (!indexBeingEdited.length) {
          const urlParams = new URLSearchParams(window.location.hash)
          let langParam = urlParams.get('lang')
          if (langParam) {
            langParam = langParam.replace(/['"]+/g, '')
            item.lang = langParam
          }
          item.io.emit({
            action: 'userEditing',
            value: { indexId: index, dashboardId: item.dashboardId }
          })
          FpSdk.FpArchitectEditor.edit({
            item: item.original,
            lang: item.lang,
            dashboardId: item.dashboardId
          }).then(newItem => {
            item.io.emit({action: 'userDisconnect'})
            item.io.emit({
              action: 'replace',
              id: item.id,
              root: item.root,
              value: newItem
            })
          })
            .catch(_ => {
              // Close de la modal, sans save
              item.io.emit({action: 'userDisconnect'})
            })
        }
      }
    }

    let deleteHandler = options.querySelector('.delete-handler')
    if (deleteHandler) {
      deleteHandler.onclick = _ => {
        if (!item.userEditing) {
          item.userEditing = []
        }
        const indexBeingEdited = item.userEditing.filter(v => v.indexId === index)
        if (!indexBeingEdited.length) {
          item.io.emit({
            action: 'delete',
            root: item.root,
            id: item.id
          })
        }
      }
    }

    item.io.on(
      {
        action: 'add',
        id: item.id
      },
      newItem => {
        if (item.child && item.child.events) {
          item.child.events.add(newItem)
        }
      }
    )

    item.io.on(
      {
        action: 'replace',
        id: item.id
      },
      newItem => {
        let idx = item.parent.items.indexOf(item)
        if (idx !== -1) item.parent.events.update(idx, newItem)
      }
    )

    item.io.on(
      {
        action: 'delete',
        id: item.id
      },
      () => {
        let idx = item.parent.items.indexOf(item)
        if (idx !== -1) item.parent.events.delete(idx)
      }
    )
    /** ***** Events End *******/

    return options
  }
}
