'use strict'

var ipfsd = require('ipfsd-ctl')
var merkledag = require('../index.js')
var assert = require('assert')

/*global describe, before, it*/

describe('mdag interface', function () {
  var mdag
  before(function (done) {
    ipfsd.local(function (err, api) {
      if (err) throw err
      mdag = merkledag(api)
      done()
    })
  })

  it('got mdag interface', function () {
    assert(mdag)
  })

  describe('immutability', function () {
    var node
    before(function (done) {
      node = mdag.node('testdata', [])
      done()
    })
    it('should not be mutable', function () {
      assert.throws(function () {
        node.data = 'fonk'
      }, TypeError)
    })
  })

  describe('standard mdag interaction', function () {
    var addedHash
    before(function (done) {
      var child1 = mdag.node('child1', [])
      var child2 = mdag.node('child2', [])
      var root = mdag.node(null, {'one': child1,
                                  'two': child2})
      root.add(function (err, res) {
        if (err) throw err
        addedHash = res.Hash
        done()
      })
    })

    it('should have added root', function () {
      assert.equal(addedHash, 'QmbQCJy53qo1iPN84TDGHm1MtFXHeHaLfTB7YuNXqsJQAK')
    })

    var child1, child2, child3
    before(function (done) {
      mdag.get(addedHash + '/one', function (err, res) {
        if (err) throw err
        child1 = res
        mdag.get(addedHash + '/two', function (err, res) {
          if (err) throw err
          child2 = res
          done()
        })
      })
    })

    it('should have two children', function () {
      assert.equal(child1.data, 'child1')
      assert.equal(child2.data, 'child2')
    })

    var newrootHash
    before(function (done) {
      mdag.get(addedHash, function (err, root) {
        if (err) throw err
        var child3 = mdag.node('child3 yo', [])
        var newroot = root.addLink('three', child3)
        newroot.add(function (err, res) {
          if (err) throw err
          newrootHash = res.Hash
          done()
        })
      })
    })

    it('should have made a new root with third child', function () {
      assert.equal(newrootHash, 'QmaB81UqMz1UYcP1BGwBPyqCmFKbmPUeHxksuMkk5ZTVGX')
    })

    before(function (done) {
      mdag.get(newrootHash + '/one', function (err, res) {
        if (err) throw err
        child1 = res
        mdag.get(newrootHash + '/two', function (err, res) {
          if (err) throw err
          child2 = res
          mdag.get(newrootHash + '/three', function (err, res) {
            if (err) throw err
            child3 = res
            done()
          })
        })
      })
    })

    it('should have three children', function () {
      assert.equal(child1.data, 'child1')
      assert.equal(child2.data, 'child2')
      assert.equal(child3.data, 'child3 yo')
    })
  })
})
