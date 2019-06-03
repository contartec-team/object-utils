'use strict'

const deepEqual = require('deep-equal')
const DeepDiff = require('deep-diff')

/**
 * @class
 */
class ObjectUtils {
  /**
   * Default options for {@link ObjectUtils.createPrivateAttributes}
   * 
   * @type {Object}
   * @property {Boolean} [includeFunction = false] Whether to include `func
   */
  static get DEFAULT_PRIVATE_ATTRS_OPTIONS() {
    return {
      includeFunction: false
    }
  }

  /**
   * Default params for {@link ObjectUtils.areEqual} and {@link ObjectUtils.getObjectDiff}
   * 
   * @type {Object}
   * @property {String} [strict = false] The type of comparation `==` (false) or `===` (true)
   * @property {Array} [attrNames = []] The list of `attr` names to perform the operation
   */
  static get DEFAULT_ARE_EQUAL_OPTIONS() {
    return {
      strict    : false,
      attrNames : []
    }
  }
  
  /**
   * Default functions for each `type` of value
   * 
   * @type {Object}
   * @property {Function} Array The `Array` handler function
   * @property {Function} Date The `Date` handler function
   * @property {Function} Object The `Object` handler function
   */
  static get TYPE_VALUE_FUNCTION() {
    return {
      Array   : (value) => [].concat(value),
      Date    : (value) => new Date(value),
      Object  : (value) => ObjectUtils.copyObject(value)
    }
  }

  /**
   * Returns a copy of `attributes` as private
   * 
   * @param {Object} object     The base `object`
   * @param {Object} [options]  The set of options {@link Obj}
   * 
   * @return {Object} The copy of `attributes` with all attrs as private
   * 
   * @example
   * 
   * const object = { a: 1, b: '2', c: [1, '2'], d: new Date() }
   * 
   * ObjectUtils.createPrivateAttributes(object)
   * // { _a: 1, _b: '2', _c: [1, '2'], _d: new Date() }
   */
  static createPrivateAttributes(object, options) {
    let privateAttributes = {}

    options = Object
      .assign({}, ObjectUtils.DEFAULT_PRIVATE_ATTRS_OPTIONS, options || {})

    for (const attr in object) {
      const attrValue = object[attr]

      let attrName = `_${attr}`

      if (attrValue instanceof Function && !options.includeFunction)
        attrName = attr

      privateAttributes[attrName] = attrValue
    }

    return privateAttributes
  }

  /**
   * Returns a copy of `attributes` as private
   * 
   * @param {Object} object     The base `object`
   * @param {Object} objectDiff  The set of options
   * @param {Object} [options] The set of `areEqual`'s method options {@link ObjectUtils.DEFAULT_ARE_EQUAL_OPTIONS}
   * @param {Object} [params.attrs] The list of specific attrs o compare (ie. `['a', 'b' ...]`)
   * @param {Object} [index] The set of params
   * 
   * @return {Object} The copy of `attributes` with all attrs as private
   * 
   * @example
   * 
   * const a = { a: 1, b: '2', c: [1, '2'] }
   * const b = { a: 1, b: '2', c: [1, '2'] }
   * 
   * ObjectUtils.areEqual(a, b)
   * // true
   * 
   * const c = { a: 2, b: '2', c: [1, '2', 3] }
   * const d = { a: 0, b: '2', c: [] }
   * 
   * const options = { attrs: ['b'] }
   * 
   * ObjectUtils.areEqual(c, d, options)
   * // true
   */
  static areEqual(object, objectDiff, options = {}, index = 0) {
    options = Object
      .assign({}, ObjectUtils.DEFAULT_ARE_EQUAL_OPTIONS, options || {})

    if (options.attrNames && !options.attrNames.length)
      return deepEqual(object, objectDiff, options)
    else if (index < options.attrNames.length) {
      const attrName = options.attrNames[index]
      const objectAttr = object[attrName]
      const objectDiffAttr = objectDiff[attrName]

      if (!deepEqual(objectAttr, objectDiffAttr, options))
        return false
      else {
        return ObjectUtils
          .areEqual(object, objectDiff, options, ++index)
      }
    }
    else
      return true
  }

  /**
   * Returns a object with the diff between two objects
   * 
   * @param {Object} lhs The base `object`
   * @param {Object} rhs The diff `object` to compare
   * @param {Object} [options] The set of `areEqual`'s method options {@link ObjectUtils.DEFAULT_ARE_EQUAL_OPTIONS}
   * 
   * @return {Object} The object ([specs here]{@link https://github.com/flitbit/diff}) with the diff between `lhs` and `rhs`
   * 
   * @see {@link https://github.com/flitbit/diff}
   * 
   * @example
   * 
   * const a = { a: 1, b: '2', c: [1, '2'] }
   * const b = { a: 1, b: '2', c: [1, '2'] }
   * 
   * ObjectUtils.getObjectDiff(a, b)
   * // null
   * 
   * const c = { a: 2, b: '2', c: [1, '2', 3] }
   * const d = { a: 0, b: '2', c: [] }
   * 
   * ObjectUtils.getObjectDiff(c, d)
   * // [
   * //  DiffEdit { kind: 'E', path: [ 'b' ], lhs: '2', rhs: undefined },
   * //  DiffEdit { kind: 'E', path: [ 'a' ], lhs: 2, rhs: 0 }
   * // ]
   * 
   */
  static getObjectDiff(lhs, rhs, options = {}) {
    let lhsClone = Object
      .assign({}, lhs)

    let rhsClone = Object
      .assign({}, rhs)

    options = Object
      .assign({}, ObjectUtils.DEFAULT_ARE_EQUAL_OPTIONS, options || {})

    if (options.attrNames && options.attrNames.length > 0) {
      const attrNames = options.attrNames

      lhsClone = {}
      rhsClone = {}

      for (var i = attrNames.length - 1; i >= 0; i--) {
        const attrName = options.attrNames[i]

        lhsClone[attrName] = lhs[attrName]
        rhsClone[attrName] = rhs[attrName]
      }
    }

    return DeepDiff.diff(lhsClone, rhsClone, options)
  }

  /**
   * Returns a meaningful string value
   * 
   * @param {*} value The value to be parsed
   * 
   * @return {String} The parsed `value`
   * 
   * @example
   * 
   * const a = { a: 1, b: '2', c: [1, '2'] }
   * 
   * ObjectUtils.parseString(a)
   * // {"a":1,"b":"2","c":[1,"2"]}
   * 
   * const b = new Date()
   * 
   * ObjectUtils.parseString(b)
   * // 2019-06-03T21:21:32.326Z
   */
  static parseString(value) {
    let parsedValue = value

    if (value && typeof(value) != 'string') {
      if (value instanceof Date)
        parsedValue = value.toJSON()
      else if (value instanceof Object)
        parsedValue = JSON.stringify(value)

      parsedValue = parsedValue ?
        parsedValue.toString() :
        value.toString()
    }

    return parsedValue
  }

  /**
   * Returns a copy (clone) of the `value` (without references)
   * 
   * @param {*} value The base `value`
   * 
   * @return {Object} The copied `value`
   * 
   * @example
   * 
   * let [a, b, c] = [[3, '4'], new Date(), {a: 1}]
   * let [aCopy, bCopy, cCopy] = [a, b, c]
   * 
   * a.push(5)
   * b.setYear(1900)
   * c.b = 2
   * 
   * a == aCopy && b == bCopy && c == cCopy
   * // true
   * 
   * let [a, b, c] = [[3, '4'], new Date(), {a: 1}]
   * let [aCopy, bCopy, cCopy] = [ObjectUtils.copyObject(a), ObjectUtils.copyObject(b), ObjectUtils.copyObject(c)]
   * 
   * a.push(5)
   * b.setYear(1900)
   * c.b = 2
   * 
   * a == aCopy || b == bCopy || c == cCopy
   * // false
   * 
   */
  static copyValue(value) {
    let valueCopy = value

    if (value) {
      const typeFunction = ObjectUtils
        .TYPE_VALUE_FUNCTION[value.constructor.name]

      valueCopy = typeFunction ?
        typeFunction(value) :
        value
    }

    return valueCopy
  }

  /**
   * Returns a copy (clone) of the `object` (without references)
   * 
   * @param {Object} object The base `object`
   * @param {Object} [attrs] The list of specified `attrs` to copy (`[] || null == Object.keys(object)`) 
   * 
   * @return {Object} The copied `object`
   * 
   * @example
   * 
   * var [a, b, c, d, e] = [1, '2', [3, '4'], new Date(), {a: 1}]
   * 
   * var object = { a: a, b: b, c: c, d: d }
   * 
   * var objectCopy = Object.assign({}, object)
   * 
   * c.push(5)
   * d.setYear(1900)
   * e.b = 2
   * 
   * objectCopy.c == c && objectCopy.d.getFullYear() == d.getFullYear() && objectCopy.e == e
   * // true
   * 
   * var [a, b, c, d, e] = [1, '2', [3, '4'], new Date(), {a: 1}]
   * 
   * var object = { a: a, b: b, c: c, d: d }
   * 
   * var objectCopy = copyObject(object)
   * 
   * c.push(5)
   * d.setYear(1900)
   * e.b = 2
   * 
   * objectCopy.c == c || objectCopy.d.getFullYear() == d.getFullYear() || objectCopy.e == e
   * // false
   * 
   */
  static copyObject(object, attrs = []) {
    if (!object)
      object = {}

    if (!attrs.length)
      attrs = Object.keys(object)

    let objectTemp = Object
      .assign({}, object)

    if (attrs.length) {
      objectTemp = {}

      attrs
        .forEach(attrName => {
          let attrValue = object[attrName]

          objectTemp[attrName] = ObjectUtils
            .copyValue(attrValue)
        })
    }

    return objectTemp
  }

  /**
   * Returns a copy (clone) of each item in `objects`
   * 
   * @param {Object} objects The list of `objects`
   * @param {Object} [attrs] [The `attrs` of {@link ObjectUtils.copyObject}]
   * 
   * @return {Object} The copied `objects`
   * 
   */
  static copyObjects(objects, attrs = []) {
    let objectsTemp = []

    if (objects && objects.length) {
      objectsTemp = objects
        .map(object => {
          return ObjectUtils
            .copyObject(object, attrs)
        })
    }

    return objectsTemp
  }

  /**
   * Returns a copy of `object` without attrs of type `type`
   * 
   * @param {(Object|Array)} object               The base `object`
   * @param {Function} [type = null]              The attrs' `type` to remove (ie `Array`, `Object`, `String`, etc)
   * @param {Boolean} [onlyShallowAttrs = false]  Whether remove only root elements or its nested (`Object` and `Array`) itens
   * 
   * @return {(Object|Array)} The copy of `object` without attrs of type `type`
   * 
   * @example
   * 
   * const object = { a: 1, b: '2', c: [1, '2'], d: new Date() }
   * 
   * ObjectUtils.removeAttrsByType(object, Array)
   * // { a: 1, b: '2', d: new Date() }
   */
  static removeAttrsByType(object, type = null, onlyShallowAttrs = false) {
    let objectTemp = {}

    if (object) {
      for (const attrName in object) {
        const attrValue = object[attrName]

        if (!(attrValue instanceof type)) {
          let valueTemp = object[attrName]

          if (!onlyShallowAttrs && attrValue && attrValue instanceof Object) {
            valueTemp = ObjectUtils
              .removeAttrsByType(object[attrName], type, false)
          }

          objectTemp[attrName] = valueTemp
        }
      }
    }

    return objectTemp
  }
}

module.exports = ObjectUtils