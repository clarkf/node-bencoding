# bencoding

A node library for encoding and decoding data, according to [the
BitTorrent specification](http://www.bittorrent.org/beps/bep_0003.html).
This library is slightly different, because it attempts to keep your
data as pristine as possible. Nothing (with the exception of integers)
is converted to a string until you tell it to.

## Why?

There are a bunch of bencoding/decoding libraries out there (see below),
but none of pass their results straight into plain javascript `Object`s
(`{}`). When using a `Buffer` as a key in an `Object`, it automatically
gets coerced into a `String`. If you have to use some complex data as a
key in a dictionary, it'll munge it when converting it to a `String`.

Take for example a `scrape` request to a HTTP tracker. According to the
[unofficial BT spec](http://wiki.theory.org/BitTorrentSpecification#Tracker_.27scrape.27_Convention),
its result is in this format (written in JS-pseudocode for clarity):

```javascript
{
    "files": {
        "[info hash]": {
            "complete":   5,
            "downloaded": 50,
            "incomplete": 10
        }
    }
}
```

Where `[info hash]` is the 20-byte `sha1` `info_hash`. When you coerce
this into a string, you get some wonky effects, such as the (20-byte)
`String`'s `length` being 1. This is not all so helpful, unless you're
completely willing disregard the `info_hash`.

## How can we fix this?

`bencoding` fixes this by creating a new structure: `BDict`. A `BDict`
represents a bencoded dictionary without coercing any `Buffer`s into
`String`s. It stores everything by index, so you have to fetch the keys
and values numerically (see API).

## Installation

With [npm](http://github.com/isaacs/npm):

    npm install bencoding

## Performance

Performance compared to:

* Mark Schmale's [bencode](https://github.com/themasch/node-bencode/)
* Tim Becker's [bncode](https://github.com/a2800276/bencode.js/)
* Stefan Bühler's [dht-bencode](https://github.com/stbuehler/nodejs-dht-bencode)

This library seems to __decode__ faster than any of the other tested
libraries. It __encodes__ quickly – second only to Mark Schmale's 
library. Results:

> Encoding:
>
> * bencoding#encode x 24,961 ops/sec ±4.12% (57 runs sampled)
> * bencode#encode x 2,637,008 ops/sec ±5.86% (58 runs sampled)
> * bncode#encode x 15,012 ops/sec ±7.66% (46 runs sampled)
> * dht-bencode#encode x 193,631 ops/sec ±10.35% (53 runs sampled)
> * Fastest is bencode#encode 
> 
> Decoding:
>
> * bencoding#decode x 29,019 ops/sec ±4.41% (55 runs sampled)
> * bencode#decode x 300 ops/sec ±6.28% (54 runs sampled)
> * bncode#decode x 1,060 ops/sec ±7.65% (50 runs sampled)
> * [dht-decode errors]
> * Fastest is bencoding#decode

You can try this yourself by running either `node
performance/encoding.js` or `node performance/decoding.js`.

## Usage

### Decoding
```javascript
var bencoding = require('bencoding'),
    data = new Buffer('d3:inti1024768e3:str5:abcde4:listli1ei2ei3eee'),
    result = bencoding.decode(data);

console.log(result);
console.log(result.toJSON());
```
Output:

```
{ keys: [ <Buffer 69 6e 74>, <Buffer 73 74 72>, <Buffer 6c 69 73 74> ],
    vals: [ 1024768, <Buffer 61 62 63 64 65>, [ 1, 2, 3 ] ],
    length: 3 }
{ int: 1024768, str: <Buffer 61 62 63 64 65>, list: [ 1, 2, 3 ] }
```

### Encoding
```javascript
var bencoding = require('bencoding'),
    object = {
        'string': "Hello World",
        'integer': 12345,
        'dictionary': {
            'key': "This is a string within a dictionary"
        },
        'list': [1, 2, 3, 4, 'string', 5, {}]
    },
    result = bencoding.encode(object);

console.log(result.toString());
```
Output:

    d6:string11:Hello World7:integeri12345e10:dictionaryd3:key36:This is a string within a dictionarye4:listli1ei2ei3ei4e6:stringi5edeee

## API

### bencode.decode
Signature: 

* {`Buffer`} `encoded` - The bencoded data, as a buffer.

Returns {`Buffer`|`BDict`|`Array`|`Number`} `result` - decoded data

### bencode.encode
Signature:

* {`Buffer`|`BDict`|`Array`|`String`|`Object`|`Number`} `data` - the
    data to encode.

Returns {`Buffer`} `result` - encoded data. 

### bencode.BDict
The BDict constructor. Accepts no arguments.

#### BDict.add
Signature:

* `key` - the key
* `value` - the value

Returns: {`BDict`} `self` - for chaining

Adds an item to `BDict` at `length`. `key` and `value` can be any object
of any kind.

#### BDict.remove
Signature: 

* {`Number`} `index` - the index to remove

Returns: {`BDict`} `self` - for chaining

Removes item at index `index` from `BDict`

#### BDict.vget
Signature:

* {`Number`} `index` - the index to get the value of

Returns: `value` - the value at index `index`.

#### BDict.kget
Signature:

* {`Number`} `index` - the index to get the key of

Returns: `value` - the key at index `index`.

#### BDict.get
Signature:

* {`Number`} `index` - the index to get the key/value of

Returns: {`Array`} `result` - an array in the format of [`key`, `value`]

#### BDict.toJSON

Returns: {`Object`} `result` - a usable representation of the `BDict`.

If you don't plan on having any complex data in keys, you can just call
toJSON to convert the BDict into a regular `Object`.

## License 

(The MIT License)

Copyright (c) 2011 Clark Fischer &lt;clark.fischer@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
