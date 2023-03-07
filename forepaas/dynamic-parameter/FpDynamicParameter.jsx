
import FpLoader from 'forepaas/core-ui/loader'
import { FpDictionary } from 'forepaas/query-builder'
import FpSdk from 'forepaas/sdk'
import { set } from 'forepaas/store/memory/action'
import { del } from 'forepaas/store/querystring/action'
import FpTranslate from 'forepaas/translate'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'


@connect(state => ({
  querystring: state.querystring,
  memory: state.memory
}))
/**
 * This component represents a chart table, it will make request
 * to the api as you scroll depending of the limit options
 * @example
 * <FpDynamicParameter
 *    label="Example dynP"
 *    dynamic-parameter={
 *      {
 *        id: 'exampleId',
 *        dictionary:'id-dictionary',
 *        component:'selectbox',
 *        parents:['id-parent'],
 *        type: 'filter'
 *      }
 *    }
 * />
 */
class FpDynamicParameter extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props['dynamic-parameter] - Options of the dynamic parameter
   * @param {String} props['dynamic-parameter].id - Id used by chart to link to dynamic parameter
   * @param {String} props['dynamic-parameter].dictionary - Column to select to get array of options
   * @param {String} props['dynamic-parameter].component - Component used
   * @example  props['dynamic-parameter].component = 'datepicker' || 'selectbox' || 'toggle' || 'radio'
   * @param {Array} [props['dynamic-parameter].parents] - Represents an ids array of dyanmic parameter id.
   * Options of dynamic parameter will be filtered depending of parent dictionary. [Id of parent]
   * @param {Object} [props['dynamic-parameter].type='filter'] - Will influence the change made to the chart request.
   * Can be 'filter' || 'scale'
   * @param {String} [props['dynamic-parameter].reference=props['dynamic-parameter].dictionary] - Reference used by chart to link to the value
   * @param {string} [props.label] - Label to be used in case of error while trying to get the dictionary
   * @param {string} [props.customclass] - Custom className for the component
   * @param {Object} [props.style] - Style set to the component
   */
  constructor (props) {
    super(props)
    this.dynamicParameter = _cloneDeep(props['dynamic-parameter'])
    this.component = 'dynamic-parameter-' + this.dynamicParameter.component
    if (this.component && this.component.indexOf('.') !== -1) {
      this.component = this.component.split('.')[0]
    }
    this.id = this.dynamicParameter.id
    this.state = {
      component: null,
      items: []
    }
    this.customItems = this.dynamicParameter.items
    this.reload = this.reload.bind(this)
  }

  componentDidMount () {
    let dictionary
    if (this.component && !FpSdk.modules[this.component]) {
      let error = `Module ${this.dynamicParameter.component} required by module dynamic-parameter not found`
      console.error(error)
      return this.setState({error: error})
    }
    if (this.dynamicParameter && this.dynamicParameter.dictionary) {
      if (typeof this.dynamicParameter.dictionary === 'string') { dictionary = this.dynamicParameter.dictionary } else { dictionary = this.dynamicParameter.dictionary.id }
    }
    var meta = {}
    _assign(meta,this.dynamicParameter,{
      type: this.dynamicParameter.type || 'filter',
      reference: this.dynamicParameter.reference || dictionary
    })
    if (this.dynamicParameter.parents) {
      this.dynamicParameter.parents.forEach((parent) => {
        FpSdk.modules.store.subscribeKey(`querystring.${parent}`, (val) => {
          if (typeof val !== 'undefined') this.reload()
        })
        FpSdk.modules.store.subscribeKey(`memory.${parent}`, (val) => {
          if (typeof val !== 'undefined') this.reload()
        })
      })
    }
    if (!this.props.memory[this.id] || !isEqual(this.props.memory[this.id], meta)) FpSdk.modules.store.dispatch(set(this.id, meta))
    this.reload()
  }

  componentWillUnmount () {
    if (this.dynamicParameter.resetOnDelete) {
      FpSdk.modules.store.dispatch(del(this.id))
    }
  }

  /**
   * prepareItems translate all items contained in dynamicParameters.items
   */
  prepareItems () {
    if (
      this.dynamicParameter.type === 'scale' &&
      typeof this.dynamicParameter.items === 'object' &&
      !Array.isArray(this.dynamicParameter.items)
    ) {
      let items = []
      Object.keys(this.dynamicParameter.items).forEach(key => {
        if (this.dynamicParameter.items[key]) {
          items.push({ label: FpTranslate(key), value: key })
        }
      })
      this.dynamicParameter.items = items
    } else {
      this.dynamicParameter.items = (Array.isArray(this.dynamicParameter.items) && this.dynamicParameter.items) || []
      this.dynamicParameter.items = this.dynamicParameter.items.map((item) => {
        item.label = FpTranslate(this.id + '-' + item.label, {'default': item.label || item.value})
        return item
      })
    }
  }

  /**
   * reload is use to reset the dynamicParameter items
   * It will rerender the dynamicParameter.component with new items
   * It is called when the component is mounted and when a dynamicParameter.parents is updated
   */
  reload () {
    let dictionary, parents, filter, component, tableName
    filter = (typeof this.dynamicParameter.dictionary === 'object' && this.dynamicParameter.dictionary.filter) || {}
    dictionary = (typeof this.dynamicParameter.dictionary === 'object' && this.dynamicParameter.dictionary.id) || this.dynamicParameter.dictionary
    tableName = this.dynamicParameter.tableName
    if (!dictionary) {
      this.prepareItems()
      return this.setState({component: React.createElement(FpSdk.modules[this.component], this.dynamicParameter)})
    }
    if (this.dynamicParameter.parents) {
      parents = this.dynamicParameter.parents
      parents.forEach((parent) => {
        if (this.props.memory[parent]) { filter[this.props.memory[parent].reference] = this.props.querystring[parent] }
      })
    }
    return new FpDictionary({id: dictionary, filter: filter, tableName: tableName})
      .compute()
      .then((items) => {
        this.dynamicParameter.items = this.customItems || []
        this.dynamicParameter.items = this.dynamicParameter.items.concat(items)
        // Add label if null
        this.dynamicParameter.items.forEach(dyp => {
          if (!dyp.label) dyp.label = dyp.value
        })
        // Remove duplicate
        this.dynamicParameter.items = [...new Set(this.dynamicParameter.items.map(JSON.stringify))].map(JSON.parse)
        this.prepareItems()
        let props = Object.assign({}, this.dynamicParameter)
        props.style = this.props.style || this.dynamicParameter.style
        props.customclass = this.props.customclass
        component = React.createElement(FpSdk.modules[this.component], props)
        this.setState({component: component})
      })
      .catch((err) => {
        console.error(err)
        let args = [this.props.label ? this.props.label : this.dynamicParameter.reference]
        let error = FpTranslate('FpDynamicParameter::NotFound', args)
        this.setState({error: error})
      })
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    if (this.state.component) {
      return this.state.component
    }
    if (this.state.error) {
      return (
        <div className='dynamic-parameter-error'>
          <p>{this.state.error}</p>
        </div>
      )
    }
    return <FpLoader />
  }
}

FpDynamicParameter.propTypes = {
  memory: PropTypes.object,
  querystring: PropTypes.object,
  label: PropTypes.string,
  'dynamic-parameter': PropTypes.shape({
    dictionary: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    reference: PropTypes.string,
    type: PropTypes.string,
    component: PropTypes.string,
    resetOnDelete: PropTypes.bool,
    parents: PropTypes.array,
    id: PropTypes.string
  }),
  customclass: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default FpDynamicParameter
