# node ipfs mdag

Merkledag abstraction in javascript, all nodes are immutable and return new nodes when links are added.

example:

```js
var child1 = mdag.node("child1", [])
var child2 = mdag.node("child2", [])
var root = mdag.node(null, {"one": child1,
                            "two": child2})

root.add(function (err, res) {
  console.log(res.Hash) // => QmbQCJy53qo1iPN84TDGHm1MtFXHeHaLfTB7YuNXqsJQAK
})

var child3 = mdag.node("child3 yo", [])
var newRoot = root.addLink("three", child3)

newRoot.add(function (err, res) {
  console.log(res.Hash) // => QmaB81UqMz1UYcP1BGwBPyqCmFKbmPUeHxksuMkk5ZTVGX
})

// root is left unchanged...

root.add(function (err, res) {
  console.log(res.Hash) // => QmbQCJy53qo1iPN84TDGHm1MtFXHeHaLfTB7YuNXqsJQAK
})

root.data = 'test'
// never changes, and trows TypeError if 'use strict' is used
root.data // => ''

```