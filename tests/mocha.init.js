'use strict'

const chai = require('chai')
const chaiThings = require('chai-things')

chai.use(chaiThings)
chai.use(require('sinon-chai'))

global.sinon = require('sinon')
global.expect = chai.expect