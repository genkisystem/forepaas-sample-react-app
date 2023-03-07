import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import FpSdk from 'forepaas/sdk'
import PropTypes from 'prop-types'
import FpTranslate from 'forepaas/translate'

/**
 * Renders a link
*/
export default class FpLink extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {string} props.url - URL to reach
   * @param {string} props.icon - Icon to display
   * @param {string} props.text - Text to display
   * @param {string|Array} props.html - HTML to display
   * @param {boolean} props.nested - Determines if it's a child route
   * @param {string} props.customclass - Custom className for the component
   * @param {string} props.style - Style set to the component
   */
  constructor (props) {
    super(props)
    this.state = {
      pathname: this.props.url,
      search: window.location.hash.split('?')[1]
    }
    this.callback = this.callback.bind(this)
    this.renderLink = this.renderLink.bind(this)
  }

  /**
   * After the component is mounted,
   * the callback is launched when the query string is changed
   */
  componentWillMount () {
    let configDp = FpSdk.Utils.getAllFromKey('dynamic-parameter', 'dynamic-parameter.id')
    configDp.forEach(id => FpSdk.modules.store.subscribeKey(`querystring.${id}`, this.callback))
  }

  callback () {
    this.state = {
      pathname: this.props.url,
      search: window.location.hash.split('?')[1]
    }
    this.setState(this.state)
  }

  /**
   * Renders the link
   */
  renderLink () {
    let FpHtml = FpSdk.getModule('html')
    return (
      <div ref='nav-link'>
        { (this.props.icon) && (<i className={this.props.icon} />) }
        { this.props.text && <span className='link-text' dangerouslySetInnerHTML={{ __html: FpTranslate(this.props.text, { default: this.props.text }) }} /> }
        { this.props.html && <FpHtml className='link-html' content={this.props.html} /> }
      </div>
    )
  }

  /**
   * renders
   * @return {ReactElement} markup
   */
  render () {
    let className = 'fp-link'
    if (this.props.customclass) {
      className += ` ${this.props.customclass}`
    }
    const link = this.renderLink()
    if (this.props.url) {
      return (
        <NavLink exact={!this.props.nested} className={className} activeClassName='active' style={this.props.style} to={this.state}>
          {link}
        </NavLink>
      )
    }
    return (
      <Link className={className} style={this.props.style} to={this.state}>
        {link}
      </Link>
    )
  }
}

FpLink.propTypes = {
  url: PropTypes.string.isRequired,
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
  html: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  nested: PropTypes.bool,
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
