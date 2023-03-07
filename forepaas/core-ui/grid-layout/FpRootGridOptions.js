import FpSdk from 'forepaas/sdk'
import { FpArchitectServer } from 'forepaas/sdk/architect'
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

const componentsList = (components) => {
  return components.map(comp => {
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
  }).join('\n')
}
const innerHtml = (components, that) => {
  return `
    <i class='handler fpui fpui-plus add-handler fp-architect-tool'>
      <ul class='fpui-edit-options-dropdown'>
        ${componentsList(components)}
      </ul>
    </i>
    <div class='handler tooltip-container fp-architect-tool'>
      <i class='fpui fpui-menu menu-handler'></i>
      <span class='tooltip'>${FpTranslate('Menu editor')}</span>
    </div>
    <div class='handler tooltip-container fp-architect-tool'>
      <i class='fa fa-undo undo-handler'></i>
      <span class='tooltip'>${FpTranslate('Undo')}</span>
    </div>
    <div class='handler tooltip-container fp-architect-tool'>
      <i class='fa fa-repeat redo-handler'></i>
      <span class='tooltip'>${FpTranslate('Redo')}</span>
    </div>
    <div class='handler tooltip-container fp-architect-tool' style="width:70px;">
      <i class='fa fa-user users-handler'><span style="padding-left:7px;">${that.users.length}</span></i>
      <span style="max-width:250px;" class='tooltip'>
        <ul style="list-style:none; padding:0 10px;"> 
          ${usersList(that)}
        </ul>
      </span>
    </div>
    <div class='handler tooltip-container fp-architect-tool'>
      <i class='fa fa-save save-handler'></i>
      <span class='tooltip'>${FpTranslate('Save')}</span>
    </div>
    <div class='handler tooltip-container fp-architect-tool'>
      <i class='fa fa-play read-handler'></i>
      <span class='tooltip'>${FpTranslate('ReadOnly')}</span>
    </div>
    <div class='handler tooltip-container fp-architect-read'>
      <i class='fa fa-pencil edit-handler'></i>
      <span class='tooltip'>${FpTranslate('Editor')}</span>
    </div>
  `
}

const usersList = (that) => {
  if (!that.users) return {}
  return that.users
    .map(user => {
      return `<li class="user-handler" id='${user.id}'><span class='user-handler-icon' style='background-color:${user.color}'></span>${user.name}</li>`
    })
    .join('\n')
}

const _readArgs = () => {
  let tmp, res
  if (document.location.href.length === 0) return {}
  tmp = document.location.href.split('?') ? document.location.href.split('?')[1] : ''
  if (!tmp) return {}
  res = {}
  tmp = tmp.split('&')
  tmp.forEach((t) => {
    t = t.split('=')
    if (t.length === 2) {
      res[t[0]] = decodeURIComponent(t[1])
      try {
        res[t[0]] = JSON.parse(res[t[0]])
      } catch (err) {}
    }
  })
  return res
}

export default class FpRootGridOptions {
  constructor (item) {
    this.item = item
    this.authorizedEvents = {
      save: true,
      undo: true,
      redo: true
    }
    this.users = []
    this.elem = document.createElement('div')
    this.initElem()
    FpArchitectServer()
      .then((io) => {
        this.item.io = io
        this.item.io.on({
          action: 'add',
          id: this.item.id
        }, newItem => {
          this.item.events.add(newItem)
        })
        this.item.io.on({
          action: 'refresh',
          root: this.item.root
        }, message => {
          this.item.events.refresh(message.items, message.itemId, message.itemIndex)
        })
        this.item.io.on({
          action: 'authorizedEvents'
        }, message => this.refresh(message))
        this.item.io.on({
          action: 'usersList'
        }, users => {
          this.users = users
          this.initElem()
        })
      })
    /** ***** Events End *******/
  }

  initElem () {
    this.elem.classList.add('fp-root-edit-options')
    // Template of the options
    this.elem.innerHTML = innerHtml(this.item.components, this)
    /** ***** Events Start *******/
    let context = this
    this.elem.querySelectorAll('.add-handler li').forEach(elem => {
      elem.onclick = function (e) {
        e.stopPropagation()
        let type = this.getAttribute('id')
        let component = componentByType(context.item.components, type)
        if (component && component.edit === false) {
          return context.item.io.emit({
            action: 'add',
            root: context.item.root,
            id: context.item.id,
            value: { type }
          })
        }
        const urlParams = new URLSearchParams(window.location.hash)
        let langParam = urlParams.get('lang')
        let lang = 'en'
        if (langParam) {
          langParam = langParam.replace(/['"]+/g, '')
          lang = langParam
        }
        FpSdk.FpArchitectEditor
          .edit({
            item: {type},
            lang: context.item.lang,
            dashboardId: context.item.dashboardId
          })
          .then((newItem) => {
            context.item.io.emit({
              action: 'add',
              root: context.item.root,
              id: context.item.id,
              value: newItem
            })
          })
      }
    })
    this.elem.querySelector('.menu-handler').onclick = _ => {
      FpSdk.FpArchitectMenuEditor
        .edit({ lang: this.item.lang })
        .then((menus) => {
          this.item.io.emit({
            action: 'update',
            root: context.item.root,
            id: 'menu',
            value: menus
          })
        })
    }

    this.elem.querySelector('.undo-handler').onclick = _ => {
      if (!this.authorizedEvents['undo']) return
      this.item.io.emit({
        action: 'undo'
      })
    }
    this.elem.querySelector('.redo-handler').onclick = _ => {
      if (!this.authorizedEvents['redo']) return
      this.item.io.emit({
        action: 'redo'
      })
    }
    this.elem.querySelector('.save-handler').onclick = _ => {
      if (!this.authorizedEvents['save']) return
      this.item.io.emit({
        action: 'save'
      })
    }

    let mode = 'editor'
    mode = _readArgs().mode || 'editor'
    if (mode === 'readonly') document.querySelector('body').classList.add('fp-architect-disable')

    this.elem.querySelector('.read-handler').onclick = () => {
      document.querySelector('body').classList.add('fp-architect-disable')
      mode = 'readonly'
    }
    this.elem.querySelector('.edit-handler').onclick = () => {
      document.querySelector('body').classList.remove('fp-architect-disable')
      mode = 'editor'
    }
  }

  delete () {
    if (this.item.io) {
      this.item.io.remove({action: 'add', id: this.item.id})
      this.item.io.remove({action: 'refresh', root: this.item.root})
      this.item.io.remove({action: 'authorizedEvents'})
    }
  }

  refresh (authorizedEvents) {
    this.authorizedEvents = authorizedEvents
    let options = document.querySelector('.fp-root-edit-options')
    if (options) {
      Object.keys(this.authorizedEvents).forEach(type => {
        let button = options.querySelector(`.${type}-handler`)
        if (button) {
          if (button) {
            if (this.authorizedEvents[type]) {
              button.classList.remove('disabled')
              button.parentNode.classList.remove('disabled')
            } else {
              button.classList.add('disabled')
              button.parentNode.classList.add('disabled')
            }
          }
        }
      })
    }
  }
}
