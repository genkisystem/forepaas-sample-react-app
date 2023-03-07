import React from 'react'
import PropTypes from 'prop-types'

class Refresh extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.reload - Allow to reload the chart
   */
  constructor (props) {
    super(props)
    this.state = {}
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    return <i onClick={() => this.props.reload(true)} className='fp-toolbar-refresh fp fp-refresh' />
  }
}

Refresh.propTypes = {
  reload: PropTypes.func
}

export default Refresh
