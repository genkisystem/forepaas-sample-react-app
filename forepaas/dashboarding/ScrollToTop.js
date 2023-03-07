import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

class ScrollToTop extends Component {
  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location) {
      if (document.querySelector('.switch').scrollTo) document.querySelector('.switch').scrollTo(0, 0)
    }
  }

  render () {
    return this.props.children
  }
}

ScrollToTop.propTypes = {
  location: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
}

export default withRouter(ScrollToTop)
