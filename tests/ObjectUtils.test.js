'use strict'

const ObjectUtils = require('../lib/ObjectUtils')

describe('ObjectUtils', () => {
  const ATTR_NAMES = [
    'a',
    'b',
    'c',
    'd'
  ]

  function getDefaultObjectMock(params, shouldGenerateRandomValues = true) {
    let object = Object
      .assign({}, params)

    for (var i = ATTR_NAMES.length - 1; i >= 0; i--) {
      let valueInt = 65
        
      if (shouldGenerateRandomValues)
        valueInt = Math.floor(Math.random() * (128 - 65 + i)) + 65 + i

      const value = i % 2 == 0 ?
        valueInt :
        String.fromCharCode(valueInt)

      object[ATTR_NAMES[i]] = value
    }

    return object
  }

  function getDefaultObjectDiffMock(object) {
    let objectDiff = Object
      .assign({}, object)

    const attrName = Object
      .keys(objectDiff)[0]

    objectDiff[attrName] += objectDiff[attrName]

    return objectDiff
  }

  function getObjectMock(params, nestedObjectsLength = 0, shouldGenerateRandomValues = false, index = 0, nestedObject = {}) {
    let object = getDefaultObjectMock(params, shouldGenerateRandomValues)

    if (nestedObjectsLength > 0) {
      if (!nestedObject)
        nestedObject = getDefaultObjectMock(params, shouldGenerateRandomValues)

      if (index < nestedObjectsLength) {
        object.nestedObject = nestedObject

        return getObjectMock(params, nestedObjectsLength, shouldGenerateRandomValues, ++index, object)
      }
      else
        return nestedObject
    }
    else
      return object
  }

  describe('.createPrivateAttributes', () => {
    let DEFAULT_PARAMS, objectWithPrivateAttrs

    before(() => {
      DEFAULT_PARAMS = {
        tableName         : 'employees',
        hasTimestamps     : true,
        soft              : true,
        idAttribute       : 'id',

        visible           : ['cpf', 'name', 'role', 'id', 'enrollment', 'organization_id'],

        hidden            : ['created_at', 'updated_at', 'deleted_at', 'restored_at'],

        constraints       : ['cpf', 'organization_id', 'enrollment', 'role'],

        randomFunction    : function() {
          return 'Random af'
        }
      }

      objectWithPrivateAttrs = ObjectUtils
        .createPrivateAttributes(DEFAULT_PARAMS)
    })

    it('should return an object with `_tableName` settled', () => {
      const tableName = DEFAULT_PARAMS.tableName

      expect(objectWithPrivateAttrs._tableName).to.eql(tableName)
    })

    it('should return an object with `_hasTimestamps` settled', () => {
      const hasTimestamps = DEFAULT_PARAMS.hasTimestamps

      expect(objectWithPrivateAttrs._hasTimestamps).to.eql(hasTimestamps)
    })

    it('should return an object with `_visible` settled', () => {
      const visible = DEFAULT_PARAMS.visible

      expect(objectWithPrivateAttrs._visible).to.eql(visible)
    })

    it('should return an object with `_hidden` settled', () => {
      const hidden = DEFAULT_PARAMS.hidden

      expect(objectWithPrivateAttrs._hidden).to.eql(hidden)
    })

    it('should return an object with `_constraints` settled', () => {
      const constraints = DEFAULT_PARAMS.constraints

      expect(objectWithPrivateAttrs._constraints).to.eql(constraints)
    })

    it('should return the function object as public', () => {
      const randomFunction = DEFAULT_PARAMS.randomFunction

      expect(objectWithPrivateAttrs.randomFunction).to.eql(randomFunction)
    })

    context('when `options.includeFunction` is true', () => {
      let objectWithPrivateAttrs

      before(() => {
        objectWithPrivateAttrs = ObjectUtils
          .createPrivateAttributes(DEFAULT_PARAMS, { includeFunction: true })
      })

      it('should return the function object as private', () => {
        const randomFunction = DEFAULT_PARAMS.randomFunction

        expect(objectWithPrivateAttrs._randomFunction).to.eql(randomFunction)
      })
    })
  })

  describe('.areEqual', () => {
    context('when equal', () => {
      context('when both `objects` have the same `type`', () => {
        context('when instance of `String`', () => {
          let object, objectDiff

          before(() => {
            object = getDefaultObjectMock()
            objectDiff = Object
              .assign({}, object)
          })

          it('should return `true`', () => {
            const areEqual = ObjectUtils
              .areEqual(object, objectDiff)

            expect(areEqual).to.true
          })
        })

        context('when instance of `Date`', () => {
          let object, objectDiff

          before(() => {
            const date = new Date()

            object = getDefaultObjectMock({
              date: date
            })

            objectDiff = Object
              .assign({}, object)

            objectDiff.date = new Date(date)
          })

          it('should return `true`', () => {
            const areEqual = ObjectUtils
              .areEqual(object, objectDiff)

            expect(areEqual).to.true
          })
        })
      })
    })

    context('when not equal', () => {
      context('on value', () => {
        context('when param `attrNames` is passed', () => {
          context('when all of the `attrNames` are equal', () => {
            let object, objectDiff, params

            before(() => {
              object = getDefaultObjectMock()
              objectDiff = getDefaultObjectDiffMock(object)

              const attrName = Object
                .keys(object)[1]

              params = {
                attrNames: [attrName]
              }
            })

            it('should return `true`', () => {
              const areEqual = ObjectUtils
                .areEqual(object, objectDiff, params)

              expect(areEqual).to.true
            })
          })

          context('when some of the `attrNames` are not equal', () => {
            let object, objectDiff, params

            before(() => {
              object = getDefaultObjectMock()
              objectDiff = getDefaultObjectDiffMock(object)

              const attrName = Object
                .keys(object)[0]

              params = {
                attrNames: [attrName]
              }
            })

            it('should return `false`', () => {
              const areEqual = ObjectUtils
                .areEqual(object, objectDiff, params)

              expect(areEqual).to.false
            })
          })
        })

        context('when param `attrNames` is not passed', () => {
          let object, objectDiff

          before(() => {
            object = getDefaultObjectMock()
            objectDiff = getDefaultObjectDiffMock(object)
          })

          it('should return `false`', () => {
            const areEqual = ObjectUtils
              .areEqual(object, objectDiff)

            expect(areEqual).to.false
          })
        })
      })
    })
  })

  describe('.getObjectDiff', () => {
    context('when equal', () => {
      context('when both `lhss` have the same `type`', () => {
        context('when instance of `String`', () => {
          let lhs, rhs

          before(() => {
            lhs = getDefaultObjectMock()
            rhs = Object
              .assign({}, lhs)
          })

          it('should return `null`', () => {
            const diffs = ObjectUtils
              .getObjectDiff(lhs, rhs)

            expect(diffs).to.not.exist
          })
        })

        context('when instance of `Date`', () => {
          let lhs, rhs

          before(() => {
            const date = new Date()

            lhs = getDefaultObjectMock({
              date: date
            })

            rhs = Object
              .assign({}, lhs)

            rhs.date = new Date(date)
          })

          it('should return `null`', () => {
            const diffs = ObjectUtils
              .getObjectDiff(lhs, rhs)

            expect(diffs).to.not.exist
          })
        })
      })
    })

    context('when not equal', () => {
      context('on value', () => {
        context('when param `attrNames` is passed', () => {
          context('when all of the `attrNames` are equal', () => {
            let lhs, rhs, params

            before(() => {
              lhs = getDefaultObjectMock()
              rhs = getDefaultObjectDiffMock(lhs)

              const attrName = Object
                .keys(lhs)[1]

              params = {
                attrNames: [attrName]
              }
            })

            it('should return `null`', () => {
              const diffs = ObjectUtils
                .getObjectDiff(lhs, rhs, params)

              expect(diffs).to.not.exist
            })
          })

          context('when some of the `attrNames` are not equal', () => {
            let lhs, rhs, params

            before(() => {
              lhs = getDefaultObjectMock()
              rhs = getDefaultObjectDiffMock(lhs)

              const changedAttrName = Object
                .keys(lhs)[0]

              const deletedAttrName = Object
                .keys(lhs)[1]

              delete rhs[deletedAttrName]

              params = {
                attrNames: [
                  changedAttrName,
                  deletedAttrName
                ]
              }
            })

            it('should return the attrs differences', () => {
              const diffs = ObjectUtils
                .getObjectDiff(lhs, rhs, params)

              let attrNameDiffs = []

              diffs
                .sort((dA, dB) => {
                  return dA.path.join('.') < dB.path.join('.')
                })
                .forEach(d => {
                  attrNameDiffs
                    .push(d.path.join('.'))
                })

              expect(attrNameDiffs).to.deep.equal(params.attrNames)
            })
          })
        })

        context('when param `attrNames` is not passed', () => {
          let lhs, rhs, attrNameDiffs

          before(() => {
            lhs = getDefaultObjectMock()
            rhs = getDefaultObjectDiffMock(lhs)

            attrNameDiffs = [
              Object
                .keys(lhs)[0]
            ]
          })

          it('should return the attrs differences', () => {
            const diffs = ObjectUtils
              .getObjectDiff(lhs, rhs)

            let attrNameDiffsTemp = []

            diffs
              .sort((dA, dB) => {
                return dA.path.join('.') < dB.path.join('.')
              })
              .forEach(d => {
                attrNameDiffsTemp
                  .push(d.path.join('.'))
              })

            expect(attrNameDiffsTemp).to.deep.equal(attrNameDiffs)
          })
        })
      })
    })
  })

  describe('.parseString', () => {
    context('when instance of `Number`', () => {
      let value, parsedValue

      before(() => {
        value = 2

        parsedValue = ObjectUtils
          .parseString(value)
      })

      it('should return the `Number` in `string`', () => {
        expect(parsedValue).to.eql(value.toString())
      })
    })

    context('when instance of `String`', () => {
      let value, parsedValue

      before(() => {
        value = 'odekodke'

        parsedValue = ObjectUtils
          .parseString(value)
      })

      it('should return the string value', () => {
        expect(parsedValue).to.eql(value)
      })
    })

    context('when instance of `Date`', () => {
      let value, parsedValue

      before(() => {
        value = new Date()

        parsedValue = ObjectUtils
          .parseString(value)
      })

      it('should return the `toJSON` value', () => {
        expect(parsedValue).to.eql(value.toJSON())
      })
    })

    context('when instance of `Array`', () => {
      let value, parsedValue

      before(() => {
        value = [1, 2, 3]

        parsedValue = ObjectUtils
          .parseString(value)
      })

      it('should return the array as `String`', () => {
        const arrayString = `[${value.join(',')}]`

        expect(parsedValue).to.eql(arrayString)
      })
    })

    context('when instance of `Object`', () => {
      let value, parsedValue

      before(() => {
        value = {
          w: 1,
          x: new Date(),
          y: [1, 2, 3],
          z: {
            a: 3,
            b: '2',
            c: [0, 1, 2]
          }
        }

        parsedValue = ObjectUtils
          .parseString(value)
      })

      it('should return the `JSON.stringify` value', () => {
        expect(parsedValue).to.eql(JSON.stringify(value))
      })
    })
  })

  describe('.copyValue', () => {    
    context('when `value` is an `Array`', () => {
      const VALUE = ['arpel', 1, 3]

      it('should return a copy of `value`', () => {
        const valueCopy = ObjectUtils
          .copyValue(VALUE)

        expect(valueCopy).to.eql(VALUE)
      })

      it('should return a copy with no reference', () => {
        let valueTemp = [].concat(VALUE)
        let valueCopy = ObjectUtils.copyValue(valueTemp)

        valueTemp
          .push(5)

        expect(valueCopy).to.not.eql(valueTemp)
      })
    })

    context('when `value` is a `Date`', () => {
      const VALUE = new Date()

      it('should return a copy of `value`', () => {
        const valueCopy = ObjectUtils
          .copyValue(VALUE)

        expect(valueCopy).to.eql(VALUE)
      })

      it('should return a copy with no reference', () => {
        let valueTemp = new Date(VALUE)
        let valueCopy = ObjectUtils.copyValue(valueTemp)

        valueTemp
          .setYear(1900)

        expect(valueCopy).to.not.eql(valueTemp)
      })
    })
    
    context('when `value` is a `Number`', () => {
      const VALUE = 2

      it('should return a copy of `value`', () => {
        const valueCopy = ObjectUtils
          .copyValue(VALUE)

        expect(valueCopy).to.eql(VALUE)
      })
    })
    
    context('when `value` is an `Object`', () => {
      const VALUE = { a: 1, b: '2', c: [3, '4'], d: new Date(), e: {a: 1} }

      it('should return a copy of `value`', () => {
        const valueCopy = ObjectUtils
          .copyValue(VALUE)

        expect(valueCopy).to.eql(VALUE)
      })

      it('should return a copy with no reference', () => {
        let valueTemp = Object.assign({}, VALUE)
        let valueCopy = ObjectUtils.copyValue(valueTemp)

        valueTemp.c
          .push(5)

        expect(valueCopy.c).to.not.eql(valueTemp.c)
      })
    })

    context('when `value` is a `String`', () => {
      const VALUE = 'arpel'

      it('should return a copy of `value`', () => {
        const valueCopy = ObjectUtils
          .copyValue(VALUE)

        expect(valueCopy).to.eql(VALUE)
      })
    })
  })

  describe('.copyObject', () => {
    context('when `object` is not `null`', () => {
      const OBJECT = getObjectMock()

      function getObjectMock() {
        let object = {}

        ATTR_NAMES
          .forEach((attr, index) => {
            object[attr] = `${index}-${attr}`
          })

        return object
      }

      context('when `attrs` is not `null`', () => {
        context('when `attrs` are present in `object`', () => {
          let attrs, objectCopy

          before(() => {
            attrs = Object
              .keys(OBJECT)
              .slice(0, 2)

            objectCopy = ObjectUtils
              .copyObject(OBJECT, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectCopy).to.have.keys(attrs)
            expect(Object.keys(objectCopy)).to.have.lengthOf(Object.keys(attrs).length)
          })
        })

        context('when `attrs` are not present in `object`', () => {
          let attrs, objectCopy

          before(() => {
            attrs = ['zaza', 'epral']

            objectCopy = ObjectUtils
              .copyObject(OBJECT, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectCopy).to.have.keys(attrs)
            expect(Object.keys(objectCopy)).to.have.lengthOf(Object.keys(attrs).length)
          })
        })
      })

      context('when `attrs` is `null`', () => {
        let objectCopy

        before(() => {
          objectCopy = ObjectUtils
            .copyObject(OBJECT)
        })

        it('should return a copy of `object`', () => {
          expect(objectCopy).to.eql(OBJECT)
        })
      })

      context('when `object` has nested `objects`', () => {
        let object

        before(() => {
          object = Object
            .assign({}, OBJECT)

          for (let i = 0; i < 3; i++) {
            object = Object
              .assign({ object: object }, object)
          }

          object = ObjectUtils
            .copyObject(object)
        })

        it('should return a copy of `object`', () => {
          expect(object).to.eql(object)
        })
      })
    })

    context('when `object` is not `null`', () => {
      const object = null

      context('when `attrs` is not `null`', () => {
        context('when `attrs` are present in `object`', () => {
          let attrs, objectCopy

          before(() => {
            attrs = ATTR_NAMES
              .slice(0, 2)

            objectCopy = ObjectUtils
              .copyObject(object, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectCopy).to.have.keys(attrs)
            expect(Object.keys(objectCopy)).to.have.lengthOf(Object.keys(attrs).length)
          })
        })

        context('when `attrs` are not present in `object`', () => {
          let attrs, objectCopy

          before(() => {
            attrs = ['zaza', 'epral']

            objectCopy = ObjectUtils
              .copyObject(object, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectCopy).to.have.keys(attrs)
            expect(Object.keys(objectCopy)).to.have.lengthOf(Object.keys(attrs).length)
          })
        })
      })

      context('when `attrs` is `null`', () => {
        let objectCopy

        before(() => {
          objectCopy = ObjectUtils
            .copyObject(object)
        })

        it('should return an empty `object`', () => {
          expect(objectCopy).to.eql({})
        })
      })
    })
  })

  describe('.copyObjects', () => {
    context('when `objects` has itens', () => {
      let objects

      before(() => {
        objects = []

        ATTR_NAMES
          .forEach((attr, index) => {
            objects
              .push({
                [attr]: `${index}-${attr}`
              })
          })
      })

      context('when `attrs` is not `null`', () => {
        context('when `attrs` are present in `object`', () => {
          let attrs, objectsCopy

          before(() => {
            attrs = Object
              .keys(objects)
              .slice(0, 2)

            objectsCopy = ObjectUtils
              .copyObjects(objects, attrs)
          })

          it('should return a copy of `objects` with the exactly `attrs`', () => {
            expect(objectsCopy).to.all.have.keys(attrs)
          })
        })

        context('when `attrs` are not present in `object`', () => {
          let attrs, objectsCopy

          before(() => {
            attrs = ['zaza', 'epral']

            objectsCopy = ObjectUtils
              .copyObjects(objects, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectsCopy).to.all.have.keys(attrs)
          })
        })
      })

      context('when `attrs` is `null`', () => {
        let objectsCopy

        before(() => {
          objectsCopy = ObjectUtils
            .copyObjects(objects)
        })

        it('should return a copy of `object``', () => {
          expect(objectsCopy).to.eql(objects)
        })
      })
    })

    context('when `object` is not `null`', () => {
      const objects = null

      context('when `attrs` is not `null`', () => {
        context('when `attrs` are present in `object`', () => {
          let attrs, objectsCopy

          before(() => {
            attrs = ATTR_NAMES
              .slice(0, 2)

            objectsCopy = ObjectUtils
              .copyObjects(objects, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectsCopy).to.all.have.keys(attrs)
          })
        })

        context('when `attrs` are not present in `object`', () => {
          let attrs, objectsCopy

          before(() => {
            attrs = ['zaza', 'epral']

            objectsCopy = ObjectUtils
              .copyObjects(objects, attrs)
          })

          it('should return a copy of `object` with the exactly `attrs`', () => {
            expect(objectsCopy).to.all.have.keys(attrs)
          })
        })
      })

      context('when `attrs` is `null`', () => {
        let objectsCopy

        before(() => {
          objectsCopy = ObjectUtils
            .copyObjects(objects)
        })

        it('should return an empty `array`', () => {
          expect(objectsCopy).to.eql([])
        })
      })
    })
  })

  describe('.removeAttrsByType', () => {
    function addAttr(object, attrs) {
      Object
        .assign(object, attrs)

      if (object.nestedObject)
        addAttr(object.nestedObject, attrs)

      return object
    }

    context('when `object` is not `null`', () => {
      const DEFAULT_OBJECT = getObjectMock({}, 3)

      context('when there are attrs of type `type`', () => {
        context('when `type` is `Number`', () => {
          const TYPE = Number
          const ATTRS = { typeAttr: new Number() }

          let object

          before(() => {
            object = addAttr(getObjectMock({}, 3), ATTRS)
          })

          context('when `onlyShallowAttrs` is `true`', () => {
            const ONLY_SHALLOW_ATTRS = true

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without attrs of type `type`', () => {
              let objectWithoutAttrs = Object.assign({}, object)

              Object
                .keys(ATTRS)
                .forEach(attrName => delete objectWithoutAttrs[attrName])

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
          
          context('when `onlyShallowAttrs` is `false`', () => {
            const ONLY_SHALLOW_ATTRS = false

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without any nested attrs of type `type`', () => {
              const objectWithoutAttrs = Object.assign({}, DEFAULT_OBJECT)

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
        })

        context('when `type` is `String`', () => {
          const TYPE = String
          const ATTRS = { typeAttr: new String() }

          let object

          before(() => {
            object = addAttr(getObjectMock({}, 3), ATTRS)
          })

          context('when `onlyShallowAttrs` is `true`', () => {
            const ONLY_SHALLOW_ATTRS = true

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without attrs of type `type`', () => {
              let objectWithoutAttrs = Object.assign({}, object)

              Object
                .keys(ATTRS)
                .forEach(attrName => delete objectWithoutAttrs[attrName])

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
          
          context('when `onlyShallowAttrs` is `false`', () => {
            const ONLY_SHALLOW_ATTRS = false

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without any nested attrs of type `type`', () => {
              const objectWithoutAttrs = Object.assign({}, DEFAULT_OBJECT)

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
        })

        context('when `type` is `Date`', () => {
          const TYPE = Date
          const ATTRS = { typeAttr: new Date() }

          let object

          before(() => {
            object = addAttr(getObjectMock({}, 3), ATTRS)
          })

          context('when `onlyShallowAttrs` is `true`', () => {
            const ONLY_SHALLOW_ATTRS = true

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without attrs of type `type`', () => {
              let objectWithoutAttrs = Object.assign({}, object)

              Object
                .keys(ATTRS)
                .forEach(attrName => delete objectWithoutAttrs[attrName])

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
          
          context('when `onlyShallowAttrs` is `false`', () => {
            const ONLY_SHALLOW_ATTRS = false

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without any nested attrs of type `type`', () => {
              const objectWithoutAttrs = Object.assign({}, DEFAULT_OBJECT)

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
        })

        context('when `type` is `Array`', () => {
          const TYPE = Array
          const ATTRS = { typeAttr: new Array() }

          let object

          before(() => {
            object = addAttr(getObjectMock({}, 3), ATTRS)
          })

          context('when `onlyShallowAttrs` is `true`', () => {
            const ONLY_SHALLOW_ATTRS = true

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without attrs of type `type`', () => {
              let objectWithoutAttrs = Object.assign({}, object)

              Object
                .keys(ATTRS)
                .forEach(attrName => delete objectWithoutAttrs[attrName])

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
          
          context('when `onlyShallowAttrs` is `false`', () => {
            const ONLY_SHALLOW_ATTRS = false

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without any nested attrs of type `type`', () => {
              const objectWithoutAttrs = Object.assign({}, DEFAULT_OBJECT)

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
        })

        context('when `type` is `Object`', () => {
          const TYPE = Object
          const ATTRS = { nestedObject: new Object() }

          let object

          before(() => {
            object = getObjectMock({}, 3)
          })

          context('when `onlyShallowAttrs` is `true`', () => {
            const ONLY_SHALLOW_ATTRS = true

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without attrs of type `type`', () => {
              let objectWithoutAttrs = Object.assign({}, object)

              Object
                .keys(ATTRS)
                .forEach(attrName => delete objectWithoutAttrs[attrName])

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
          
          context('when `onlyShallowAttrs` is `false`', () => {
            const ONLY_SHALLOW_ATTRS = false

            let objectAttrsRemoved

            before(() => {
              objectAttrsRemoved = ObjectUtils
                .removeAttrsByType(object, TYPE, ONLY_SHALLOW_ATTRS)
            })

            it('should return the `object` without any nested attrs of type `type`', () => {
              const objectWithoutAttrs = getObjectMock()

              expect(objectAttrsRemoved).to.eql(objectWithoutAttrs)
            })
          })
        })
      })

      context('when there are no attrs of type `type`', () => {
        const TYPE = Error

        let object, objectAttrsRemoved

        before(() => {
          object = getObjectMock({}, 3)

          objectAttrsRemoved = ObjectUtils
            .removeAttrsByType(object, TYPE)
        })

        it('should return the (original) `object`', () => {
          expect(objectAttrsRemoved).to.eql(object)
        })
      })
    })

    context('when `object` is `null`', () => {
      const TYPE = Error

      let objectAttrsRemoved

      before(() => {
        objectAttrsRemoved = ObjectUtils
          .removeAttrsByType(null, TYPE)
      })

      it('should return an empty `object`', () => {
        expect(objectAttrsRemoved).to.eql({})
      })
    })
  })
})