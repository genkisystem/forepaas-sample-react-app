import FpSdk from 'forepaas/sdk';
import { set } from 'forepaas/store/querystring/action';
import FpTranslate from 'forepaas/translate';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import _debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Select, { components } from 'react-select';


@connect((state) => ({
  querystring: state.querystring
}))
class FpDynamicParameterSelectbox extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false,
      model: []
    }
    this.onChange = this.onChange.bind(this)
    this.close = this.close.bind(this)
  }

  componentDidMount () {
    if (!this.props.querystring[this.props.id]) {
      if (this.props.default) {
        process.nextTick(() => {
          this.initDefaultState()
        })
      } else if (
        this.state.model.length === 0 &&
        this.props.notEmpty &&
        this.props.items &&
        this.props.items.length > 0 &&
        this.props.items[0].value
      ) {
        let model = [this.props.items[0]]
        this.updateModel(model)
      }
    }

    this.toggleRef = React.createRef()

    // check if mobile or desktop
    if (/android|iphone|kindle|ipad/i.test(navigator.userAgent)) {
      window.addEventListener('touchstart', _debounce(this.close, 100))
    } else {
      window.addEventListener('click', _debounce(this.close, 100))
    }
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.close)
    window.removeEventListener('touchstart', this.close)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    let model = []
    if (nextProps.id && nextProps.querystring[nextProps.id]) {
      model = nextProps.querystring[nextProps.id]
      if (model && Array.isArray(model)) {
        model = model
          .map((value) => {
            for (let key in nextProps.items) {
              if (_isEqual(nextProps.items[key].value, value)) {
                return nextProps.items[key]
              }
            }
            return null
          })
          .filter((it) => {
            return it
          })
      }
    }
    if (!_isEqual(model, prevState.model)) return ({ model })
    return null
  }

  close (event) {
    if(!event) {
      this.setState({ isOpen: false })
    } else {
      // Click from outside ?
      const domNode = ReactDOM.findDOMNode(this)
      if (!domNode || !domNode.contains(event.target)) {
        this.setState({ isOpen: false })
      } else {
        // Click on toggle arrow
        if (this.toggleRef && this.toggleRef.current?.contains(event.target)) {
          this.setState({ isOpen: !this.state.isOpen, })
        } else {
          this.setState({ isOpen: true })
        }
      }

      event.stopPropagation()
    }
  }

  initDefaultState () {
    let model = []
    let def = this.props.default
    if (!this.props.multi && !Array.isArray(def)) {
      def = [def]
    }
    if (this.props.multi && !Array.isArray(def)) {
      if (typeof def === 'string') def = `${def}`.split(',')
      if (typeof def === 'number') def = [def]
    }

    model = def.map((value) => {
      return this.props.items.find(item => item.value === value)
    }).filter(it => it)
    this.updateModel(model)
  }

  updateModel (model, cb) {
    if (this.props.id) {
      let value = model.map((item) => item ? item.value : '')
      this.props.dispatch(set(this.props.id, value.length ? value : null))
      this.setState({ model })
      if (cb) process.nextTick(cb)
    }
  }

  getValue () {
    if (this.props.multi) return this.state.model
    return this.state.model[0]
  }

  onChange (val) {
    if ((Array.isArray(val) && val[0] && val[0].value === 'dynamic-parameter-loading') || (val && val.value === 'dynamic-parameter-loading')) {
      return
    }
    // If notEmpty, we prevent the change from react-select
    if (this.props.notEmpty && (!val || (Array.isArray(val) && !val.length))) return
    if (val === null) val = []
    if (!Array.isArray(val)) val = [val]
    this.updateModel(val, () => {
      if (this.props.autoClose || !this.props.multi) {
        this.close()
      }
    })
  }

  get items () {
    const { loading, items, sortBy } = this.props
    if (loading) {
      return [{ label: FpTranslate('Loading...'), value: 'dynamic-parameter-loading' }]
    }
    if (!items) return []
    if (sortBy === 'none') return items
    let sortOption = sortBy || 'label'
    let cmp = 1

    if (sortOption[0] === '-') {
      cmp = -1
      sortOption = sortOption.slice(1)
    }
    return items.sort((a, b) => {
      if (a[sortOption] > b[sortOption]) return cmp
      if (a[sortOption] < b[sortOption]) return -cmp
      return 0
    })
  }

  get style () {
    return _merge({}, _get(FpSdk.config, 'style.selectbox') || {}, this.props.style)
  }

  get customStyles () {
    return {
      control: styles => {
        if (this.style && this.style.control) Object.assign(styles, this.style.control)
        return {
          ...styles
        }
      },
      indicatorsContainer: styles => {
        if (this.style && this.style.indicatorsContainer) Object.assign(styles, this.style.indicatorsContainer)
        return {
          ...styles
        }
      },
      input: styles => {
        if (this.style && this.style.input) Object.assign(styles, this.style.input)
        return {
          ...styles
        }
      },
      option: (styles, { isDisabled, isFocused, isSelected }) => {
        if (isDisabled && this.style && this.style.optionDisabled) Object.assign(styles, this.style.optionDisabled)
        if (isFocused && this.style && this.style.optionsFocused) Object.assign(styles, this.style.optionsFocused)
        if (isSelected && this.style && this.style.optionsSelected) Object.assign(styles, this.style.optionsSelected)
        if (this.style && this.style.option) Object.assign(styles, this.style.option)
        return {
          ...styles
        }
      },
      multiValue: (styles, options) => {
        if (this.style && this.style.multiValue) Object.assign(styles, this.style.multiValue)
        return {
          ...styles,
          display: options.getValue().length === 1 ? 'inherit' : 'none'
        }
      },
      multiValueLabel: (styles, options) => {
        if (this.style && this.style.multiValueLabel) Object.assign(styles, this.style.multiValueLabel)
        return {
          ...styles,
          padding: this.props.notEmpty && options.getValue().length === 1 ? '3px 6px' : 'inherit'
        }
      },
      multiValueRemove: (styles, options) => {
        if (this.style && this.style.multiValueRemove) Object.assign(styles, this.style.multiValueRemove)
        return {
          ...styles,
          display: this.props.notEmpty && options.getValue().length === 1 ? 'none' : 'block'
        }
      },
      menu: (styles) => {
        if (this.style && this.style.menu) Object.assign(styles, this.style.menu)
        return {
          left: '6px',
          ...styles
        }
      },
      menuList: (styles) => {
        if (this.style && this.style.menuList) Object.assign(styles, this.style.menuList)
        return {
          ...styles
        }
      }
    }
  }

  render () {
    let placeholder = this.props.placeholder
      ? FpTranslate(this.props.placeholder)
      : FpTranslate('Select...')

    const DropdownIndicator = () => {
      return (
        <div ref={this.toggleRef} style={this.style.dropdownIcon}>
          <i className={`toggle ${this.props.dropdownIcon || 'fa fa-chevron-down'}`} />
        </div>
      )
    }

    const ValueContainer = ({ children, getValue, ...props }) => {
      var length = getValue().length
      if (length <= 1) {
        return (
          <components.ValueContainer {...props}>{children}</components.ValueContainer>
        )
      }
      return (
        <components.ValueContainer {...props}>
          {`${length} ${this.props.selectedMessage || 'Items selected'}`}
          {children}
        </components.ValueContainer>
      )
    }

    return (
      <div className={`select-box ${this.props.customclass || ''}`}>
        <Select
          components={{ ValueContainer, DropdownIndicator }}
          styles={this.customStyles}
          name={this.props.id}
          hideSelectedOptions={false}
          isSearchable={this.props.searchable || false}
          classNamePrefix='selectbox'
          value={this.getValue()}
          isClearable={!this.props.notEmpty}
          placeholder={placeholder}
          isMulti={this.props.multi}
          onChange={this.onChange}
          menuIsOpen={this.state.isOpen}
          options={this.items}
        />
      </div>
    )
  }
}

FpDynamicParameterSelectbox.propTypes = {
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  customclass: PropTypes.string,
  notEmpty: PropTypes.bool,
  searchable: PropTypes.bool,
  items: PropTypes.array,
  dropdownIcon: PropTypes.string,
  default: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object, PropTypes.array]),
  multi: PropTypes.bool,
  id: PropTypes.string,
  loading: PropTypes.bool,
  querystring: PropTypes.object,
  placeholder: PropTypes.string,
  dispatch: PropTypes.func,
  sortBy: PropTypes.string,
  selectedMessage: PropTypes.string
}

export default FpDynamicParameterSelectbox
