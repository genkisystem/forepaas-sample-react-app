import './FpTabHead.less'
import { FpArchitectServer } from 'forepaas/sdk/architect'

const innerHtml = (title) => {
  return `
    <i class="fpui fpui-pencil edit-handler"></i>
    <input type="text" name="title" value="${title}"/>
    <i class="fpui fpui-check check-handler"></i>
  `
}

export default class FpTabHead {
  /**
   * constructor
   * @param {object} options - Options of the tab head
   */
  constructor (options) {
    if (!window.Forepaas.config.server) return this

    let editor = document.createElement('div')
    editor.classList.add('fp-tabs-head-editor')
    editor.innerHTML = innerHtml(options.original.title || '')

    let editButton = editor.querySelector('.edit-handler')
    let checkButton = editor.querySelector('.check-handler')
    let titleInput = editor.querySelector('input')
    let title = options.element.querySelector('span')

    const onKeyPress = event => {
      switch (event.keyCode) {
        case 13: send()
      }
    }

    const open = _ => {
      checkButton.style.display = 'inline-block'
      titleInput.style.display = 'inline-block'
      title.style.display = 'none'
      editButton.style.display = 'none'
      titleInput.addEventListener('keypress', onKeyPress)
      titleInput.focus()
      titleInput.value = ''
      titleInput.value = options.original.title
    }

    const send = _ => {
      checkButton.style.display = 'none'
      titleInput.style.display = 'none'
      title.style.display = 'inline-block'
      editButton.style.display = 'inline-block'
      titleInput.removeEventListener('keypress', onKeyPress)
      options.original.title = titleInput.value
      options.io.emit({
        action: 'replace',
        id: options.id,
        root: options.dashboardId,
        value: options.original
      })
    }

    FpArchitectServer()
      .then(io => {
        options.io = io
      })

    editButton.onclick = open
    checkButton.onclick = send
    title.addEventListener('dblclick', open)

    options.element.appendChild(editor)
  }
}
