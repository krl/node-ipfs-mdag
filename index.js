'use strict'

var _ = require('lodash')
var Q = require('kew')
var i = require('seamless-immutable')

var Node = function (ipfs, data, links) {
  return i({
    data: data || '',
    links: links,
    add: function (cb) {
      var t = this
      // recurse into children
      Q.all(_.map(t.links, function (link, name) {
        var def = Q.defer()
        if (!link.Hash) { // not persisted
          link.add(function (err, res) {
            if (err) return cb(err)
            res.Name = name
            def.resolve(res)
          })
        } else {
          def.resolve(link)
        }
        return def.promise
      })).then(function (links) {
        var buf = Buffer(JSON.stringify({
          Links: links,
          Data: t.data
        }))
        ipfs.object.put(buf, 'json', function (err, res) {
          if (err) return cb(err)
          ipfs.object.stat(res.Hash, function (err, stat) {
            if (err) return cb(err)
            cb(null, {Size: stat.CumulativeSize,
                      Hash: res.Hash})
          })
        })
      })
    },
    addLink: function (name, to) {
      var clone = _.clone(this.links)
      clone[name] = to
      return new Node(ipfs, this.data, clone)
    }
  })
}

module.exports = function (ipfs) {
  return {
    node: function (data, links) {
      return new Node(ipfs, data, links)
    },
    get: function (path, cb) {
      ipfs.object.get(path, function (err, res) {
        if (err) return cb(err)
        var linkMap = {}
        _.map(res.Links, function (link) {
          linkMap[link.Name] = link
        })
        cb(null, new Node(ipfs, res.Data, linkMap))
      })
    }
  }
}
