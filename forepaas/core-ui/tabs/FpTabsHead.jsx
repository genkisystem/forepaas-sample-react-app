import React from 'react'
import PropTypes from 'prop-types'
import FpTabsHead from './FpTabsHead'
import FpTranslate from 'forepaas/translate'

/**
 * Renders tabs
 */
export default class FpTabs extends React.Component {
  componentDidMount () {
    this.tabHead = new FpTabsHead({
      id: this.props.item._id,
      original: this.props.item,
      element: this.refs['elem']
    })
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let className = 'fp-tabs-head'
    if (this.props.active) {
      className += ' active'
    }
    if (this.props.item.disabled) {
      className += ' disabled'
    }
    return (
      <li className={className} onClick={this.props.onClick} ref='elem'>
        <span dangerouslySetInnerHTML={{ __html: (this.props.title && FpTranslate(this.props.title, { default: this.props.title })) || 'New tab' }} />
      </li>
    )
  }
}

FpTabs.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
  title: PropTypes.string,
  active: PropTypes.bool
}
