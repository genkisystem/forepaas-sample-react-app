import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep'

import FpTable from 'forepaas/formatter/FpTable'
import './styles.less'

class FpChartTable extends React.Component {
  constructor (props) {
    super(props)
    this.chart = cloneDeep(this.props.chart)
    this.chart.options = this.chart.options || {}
    this.chart.options.rowHeight = this.chart.options.rowHeight || 40
    this.chart.options.padding = (typeof this.chart.options.padding !== 'undefined' && this.chart.options.padding) || 5
    this.chart.options.headerHeight = this.chart.options.headerHeight || this.chart.options.rowHeight
    this.chart.options.searchable = this.chart.options.searchable || false

    this.formatter = new FpTable(this.chart)
    if (this.formatter.columns.length > 100) throw new Error('Your table have more than 100 hundred column!')
    this.state = {
      rows: this.formatter.getRows(),
      sortOn: this.formatter.sortOn,
      reverse: this.formatter.reverse,
      scrollWidth: 0
    }
    this.theme = (this.props.chart.options && this.props.chart.options.theme) || 'standard'
    this.onResize = this.onResize.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.getClassName = this.getClassName.bind(this)
  }

  componentDidMount () {
    const elem = ReactDOM.findDOMNode(this.refs.body)
    elem.addEventListener('scroll', this.onResize)
    this.onScroll()
    window.addEventListener('resize', this.onResize)
    this.updateScrollbarWidth()
  }

  componentWillUnmount () {
    const elem = ReactDOM.findDOMNode(this.refs.body)
    elem.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
  }

  onResize () {
    this.onScroll()
    this.updateScrollbarWidth()
  }

  getClassName () {
    let cls = 'fp-table fp-table-' + this.theme
    if (this.chart.options.searchable) cls += ' fp-table-search'
    return cls
  }

  onSearch (event) {
    let value = event.target.value
    if (this.searchDebounce) clearTimeout(this.searchDebounce)
    this.searchDebounce = setTimeout(_ => {
      this.formatter.search(value)
      this.formatter.setScroll(this.refs.body.scrollTop, this.refs.body.scrollTop + this.refs.body.clientHeight)
      this.setState({ rows: this.formatter.getRows() })
    }, 100)
  }

  onSort (col) {
    if (!col.sortable) return
    this.formatter.sort(col)
    if (this.refs.body) this.formatter.setScroll(this.refs.body.scrollTop, this.refs.body.scrollTop + this.refs.body.clientHeight)
    this.setState({
      rows: this.formatter.getRows(),
      sortOn: this.formatter.sortOn,
      reverse: this.formatter.reverse
    })
  }

  getHeadIcon (col) {
    if (col === this.state.sortOn) {
      if (this.state.reverse) {
        return 'fpui fpui-chevron-up'
      }
      return 'fpui fpui-chevron-down'
    }
    return ''
  }

  updateScrollbarWidth () {
    if (this.refs.body) {
      let bodyWidth = this.refs.body.offsetWidth
      let rowWidth = this.refs.body.querySelector('.fp-row').offsetWidth
      this.setState({scrollWidth: bodyWidth - rowWidth})
    }
  }

  onScroll (event) {
    if (this.refs.body) {
      this.formatter.setScroll(this.refs.body.scrollTop, this.refs.body.scrollTop + this.refs.body.clientHeight)
      this.setState({ rows: this.formatter.getRows() })
    }
  }

  render () {
    return (
      <div className={this.getClassName()} ref='container'>
        {this.chart.options.searchable && (
          <div className='fp-search'>
            <i className='fpui fpui-search' />
            <input placeholder={this.props.chart.options.placeholder || 'Search'} type='text' onChange={(event) => this.onSearch(event)} />
          </div>
        )}
        <div className='fp-content'>
          <div className='fp-head' style={this.formatter.getHeaderStyle({scrollWidth: this.state.scrollWidth})}>
            <div className='fp-row' style={this.formatter.getHeaderRowStyle()}>
              {this.formatter.columns.map((col, c) => {
                return (
                  <div style={this.formatter.getHeaderCellStyle(col)} className={col.getClass('head')} onClick={() => this.onSort(col)} key={c}>
                    <span>{col.getHead()}</span>
                    {col.sortable && (<i className={this.getHeadIcon(col)} />)}
                  </div>
                )
              })}
            </div>
          </div>
          <div className='fp-body' ref='body' style={this.formatter.getBodyStyle()}>
            {this.state.rows.map((row, r) => {
              if (!row.display) {
                return (
                  <div className='fp-row' style={this.formatter.getBodyRowStyle()} key={r} />
                )
              }
              return (
                <div className='fp-row' style={this.formatter.getBodyRowStyle()} key={r}>
                  {this.formatter.columns.map((col, c) => {
                    return (
                      <div style={this.formatter.getBodyCellStyle(col)} className={col.getClass('body')} title={col.getString(row)} key={c}>{col.getString(row)}</div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

FpChartTable.propTypes = {
  chart: PropTypes.shape({
    request: PropTypes.object,
    options: PropTypes.object
  })
}

export default FpChartTable
