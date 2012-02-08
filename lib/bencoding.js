/*!
 * bencoding
 * Copyright(c) 2011 Clark Fischer <clark.fischer@gmail.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.1';

function BDict() {
    this.keys = [];
    this.vals = [];
    this.length = 0;
}
BDict.prototype.add = function (key, val) {
    this.keys.push(key);
    this.vals.push(val);
    this.length++;
    return this;
};

BDict.prototype.remove = function (i) {
    this.keys.splice(i, 1);
    this.vals.splice(i, 1);
    this.length--;
    return this;
};

BDict.prototype.vget = function (i) {
    return this.vals[i];
};
BDict.prototype.kget = function (i) {
    return this.keys[i];
}
BDict.prototype.get = function (i) {
    return this.keys[i] && this.vals[i] ? [this.keys[i], this.vals[i]] : undefined;
};
BDict.prototype.toJSON = function () {
    var ret = {};
    for (var i = 0; i < this.keys.length; i++) {
        ret[this.keys[i]] = this.vals[i] instanceof BDict ? this.vals[i].toJSON() : this.vals[i];
    }
    return ret;
};

function decode(buf) {
    if (!(this instanceof decode)) {
        return new decode(buf);
    }
    this.raw = buf;
    this.remainder = buf;
    return this.getNext();

};

decode.prototype.nextToken = function () {
    return String.fromCharCode(this.remainder[0]);
}

decode.prototype.findNext = function (x) {
    if (typeof x == 'string') {
        x = x.charCodeAt(0);
    }
    for (var i = 0; i < this.remainder.length; i++) {
        if (this.remainder[i] === x) return i;
    }
    return -1;
};

decode.prototype.getNext = function () {
    var tok = this.nextToken();
    switch (this.nextToken()) {
        case 'd':
            return this.consumeDictionary();
        case 'l':
            return this.consumeList();
        case 'i':
            return this.consumeInteger();
        default:
            return this.consumeByteString();
    }
};

decode.prototype.consumeDictionary = function () {
    var i = 0;
    this.ff(1);
    var dict = new BDict();
    while (this.nextToken() !== 'e') {
        dict.add(this.getNext(), this.getNext());
    }
    this.ff(1);
    return dict;
};

decode.prototype.consumeInteger = function () {
    var end = this.findNext('e'),
        intBuf = this.remainder.slice(1, end);
    this.ff(end + 1);
    return +intBuf.toString();
};

decode.prototype.consumeByteString = function () {
    var sep = this.findNext(':'),
        length = +this.remainder.slice(0, sep).toString('ascii'),
        buf;
    buf = this.remainder.slice(sep + 1, sep + 1 + length);
    this.ff(sep + 1 + length);
    return buf;
};

decode.prototype.consumeList = function () {
    this.ff(1);
    var res = [];
    while(this.nextToken() !== 'e') {
        res.push(this.getNext());
    }
    this.ff(1);
    return res;
};

decode.prototype.ff = function (o) {
    this.remainder = this.remainder.slice(o, this.remainder.length);
};

function combineBuffers(list) {
    var length = list.reduce(function (pV, tV) {
        return pV + tV.length;
    }, 0),
        res = new Buffer(length),
        i = 0;
    list.forEach(function (item) {
        item.copy(res, i);
        i += item.length;
    });
    return res;
};

function encode(obj) {
    if (typeof obj === 'string') {
        return new Buffer(obj.length + ":" + obj);
    } else if (obj instanceof Buffer) {
        var res = new Buffer(obj.length + 1 + (obj.length.toString()).length);
        res.write(obj.length.toString() + ':', 0)
        obj.copy(res, obj.length.toString().length + 1);
        return res;
    } else if (typeof obj === 'number') {
        return new Buffer('i' + (+obj) + 'e');
    } else if (Array.isArray(obj)) {
        obj = obj.map(encode);
        obj.splice(0, 0, new Buffer('l'));
        obj.push(new Buffer('e'));
        return combineBuffers(obj);
    } else if (obj instanceof BDict) {
        var parts = [];
        for (var i = 0; i < obj.length; i++) {
            parts.push(encode(obj.kget(i)));
            parts.push(encode(obj.vget(i)));
        }
        parts.splice(0, 0, new Buffer('d'));
        parts.push(new Buffer('e'));
        return combineBuffers(parts);
    } else {
        //object
        var parts = [];
        Object.keys(obj).forEach(function (k) {
            parts.push(encode(k));
            parts.push(encode(obj[k]));
        });
        parts.splice(0, 0, new Buffer('d'));
        parts.push(new Buffer('e'));
        return combineBuffers(parts);
    }
}


exports = module.exports;
exports.decode = decode;
exports.encode = encode;
exports.BDict = BDict;
