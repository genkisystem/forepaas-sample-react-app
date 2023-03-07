import FpTranslate from 'forepaas/translate'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import './FpMonthRangePicker.less'



window.moment = moment

class FpMonthRangePicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      start: {
        year: (this.props.startDate && cloneDeep(this.props.startDate)) || cloneDeep(this.props.minDate),
        text: FpTranslate('datepicker.months.start'),
        active: cloneDeep(this.props.startDate),
        click: 0
      },
      end: {
        year: (this.props.endDate && cloneDeep(this.props.endDate)) || cloneDeep(this.props.maxDate),
        text: FpTranslate('datepicker.months.end'),
        active: cloneDeep(this.props.endDate),
        click: 0
      }
    }
    this.handleMonthIconClick = this.handleMonthIconClick.bind(this)
    this.selectRange = this.selectRange.bind(this)
    this.selectDate = this.selectDate.bind(this)
    this.renderRanges = this.renderRanges.bind(this)
    this.renderMonthPicker = this.renderMonthPicker.bind(this)
  }

  getDate (type, year, month) {
    let date = moment.utc(`${year.format('YYYY')}-${month.length === 1 ? `0${month}` : month}-01`)
    let day = type === 'end' ? this.props.dayEndOfMOnth : this.props.dayStartOfMonth
    if (day === 'last') {
      return date.endOf('month')
    } else {
      return date.subtract(1, 'day').add(day, 'day')
    }
  }
  selectRange (e, key) {
    e.stopPropagation()
    e.preventDefault()
    this.props.onChange(this.props.ranges[key])
  }

  handleMonthIconClick (e, type, action) {
    if (action === 'next') {
      this.state[type].year = this.state[type].year.add(1, 'year')
    }
    if (action === 'prev') {
      this.state[type].year = this.state[type].year.subtract(1, 'year')
    }
    this.setState(this.state)
  }

  selectDate (e, type, month) {
    if (e.target.getAttribute('disabled') !== null) {
      return e.preventDefault()
    }
    let state = this.state[type]
    month = month.length > 1 ? month : `0${month}`
    state.active = this.getDate(type, state.year, month)
    state.click += 1
    let toSend = {}
    toSend[type] = state
    this.setState(toSend)
    if (this.state.start.click > 0 && this.state.end.click > 0) {
      this.props.onChange({
        startDate: this.state.start.active,
        endDate: this.state.end.active
      })
    }
  }

  renderRanges () {
    return (
      <div className='predefined-ranges'>
        { Object.keys(this.props.ranges).map(key => (
          <a
            key={key}
            onClick={(e) => this.selectRange(e, key)}
            href='#'
            className='predefined-ranges-item'
          >
            {key}
          </a>
        ))}
      </div>
    )
  }

  renderMonthPickerHeader (type) {
    let nextClass = ['month-picker-button', 'next']
    let prevClass = ['month-picker-button', 'prev']
    let disabled = {
      prev: type === 'end' && (this.state.start.active.year() >= this.state.end.year.year()),
      next: type === 'start' && (this.state.start.year.year() >= this.state.end.active.year())
    }
    if (!disabled.prev) {
      disabled.prev = parseInt(this.state[type].year.format('YYYY')) <= parseInt(this.props.minDate.format('YYYY'))
    }
    if (!disabled.next) {
      disabled.next = parseInt(this.state[type].year.format('YYYY')) >= parseInt(this.props.maxDate.format('YYYY'))
    }
    if (disabled.prev) prevClass.push('disabled')
    if (disabled.next) nextClass.push('disabled')
    return (
      <div className='month-picker-year'>
        <div className='month-picker-year-wrapper'>
          <button
            disabled={disabled.prev}
            onClick={(e) => this.handleMonthIconClick(e, type, 'prev')}
            className={prevClass.join(' ')}
          >
            <i className='month-picker-icon' />
          </button>
          <span>{this.state[type].text} : {this.state[type].year.format('YYYY')}</span>
          <button
            disabled={disabled.next}
            onClick={(e) => this.handleMonthIconClick(e, type, 'next')}
            className={nextClass.join(' ')}
          >
            <i className='month-picker-icon' />
          </button>
        </div>
      </div>
    )
  }

  isMonthDisabled (type, currentUnix, startUnix, endUnix) {
    switch (type) {
      case 'start':
        return currentUnix > endUnix || currentUnix < this.props.minDate.unix()
      case 'end':
        return currentUnix < startUnix || currentUnix > this.props.maxDate.endOf('month').unix()
    }
  }

  renderMonthPicker (type) {
    return (
      <div className='month-picker'>
        { this.renderMonthPickerHeader(type) }
        <ul className='month-picker-list'>
          { moment.monthsShort().map((monthString, index) => {
            let month, className, state, endUnix, startUnix, currentUnix
            month = (index + 1).toString()
            className = ['month-picker-list-item']
            state = this.state[type]
            endUnix = this.state.end.active.unix()
            startUnix = this.state.start.active.unix()
            currentUnix = this.getDate(type, state.year, month).unix()
            if (
              state.active.format('MMM-YYYY') === `${monthString}-${state.year.format('YYYY')}` ||
              currentUnix === endUnix ||
              currentUnix === startUnix
            ) {
              className.push('active')
            } else if (type === 'start' && currentUnix > startUnix && currentUnix < endUnix) {
              className.push('in-range')
            } else if (type === 'end' && currentUnix > startUnix && currentUnix < endUnix) {
              className.push('in-range')
            }
            if (this.isMonthDisabled(type, currentUnix, startUnix, endUnix)) className.push('disabled')
            return (
              <li
                onClick={(e) => this.selectDate(e, type, month)}
                key={index}
                className={className.join(' ')}
                disabled={this.isMonthDisabled(type, currentUnix, startUnix, endUnix)}
              >
                {monthString}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  render () {
    return (
      <div className='fp-month-range-picker'>
        {this.props.ranges && this.renderRanges()}
        {this.renderMonthPicker('start')}
        {this.renderMonthPicker('end')}
      </div>
    )
  }
}

FpMonthRangePicker.propTypes = {
  dayStartOfMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dayEndOfMOnth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  minDate: PropTypes.instanceOf(moment),
  maxDate: PropTypes.instanceOf(moment),
  onChange: PropTypes.func,
  ranges: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}

FpMonthRangePicker.defaultProps = {
  dayStartOfMonth: 1,
  dayEndOfMOnth: 'last'
}

export default FpMonthRangePicker
