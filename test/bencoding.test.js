var expect    = require('expect.js'),
    assert    = require('assert'),
    crypto    = require('crypto'),
    fs        = require('fs'),
    bencoding = require('../lib/bencoding');

function fixture(name) {
    return fs.readFileSync(__dirname + "/support/" + name);
};

function shasum(val) {
    var hasher = crypto.createHash('sha1');
    hasher.update(val);
    return new Buffer(hasher.digest('binary'), 'binary');
};

describe("bencoding", function () {
    it("Exports an appropriate API", function () {
        var bmethods = ['encode', 'decode', 'BDict'],
            bdictmethods = ['vget', 'kget', 'get', 'toJSON', 'remove', 'add'];
        expect(bencoding).to.have.key('version');
        expect(bencoding.version).to.match(/\d\.\d\.\d/i);
        expect(bencoding).to.have.keys(bmethods);
        bmethods.forEach(function (m) {
            expect(bencoding[m]).to.be.a('function');
        });
        expect(bencoding.BDict.prototype).to.have.keys(bdictmethods);
        bdictmethods.forEach(function (m) {
            expect(bencoding.BDict.prototype[m]).to.be.a('function');
        });
    });
    it("supports the BDict api", function () {
        var x = new bencoding.BDict();
        expect(x.length).to.be(0);
        expect(x.keys).to.have.length(0);
        expect(x.vals).to.have.length(0);
        expect(x.get(0)).to.be(undefined);
        expect(x.vget(0)).to.be(undefined);
        expect(x.kget(0)).to.be(undefined);
        expect(x.add('key1', 'val1')).to.be(x);
        expect(x.add('key2', 'val2')).to.be(x);
        expect(x.add('key3', 'val3')).to.be(x);
        assert.deepEqual(x.get(0), ['key1', 'val1']);
        assert.deepEqual(x.get(1), ['key2', 'val2']);
        assert.deepEqual(x.get(2), ['key3', 'val3']);
        expect(x.length).to.be(3);
        expect(x.remove(1)).to.be(x);
        expect(x.length).to.be(2);
        assert.deepEqual(x.get(1), ['key3', 'val3']);
    });
    it("can decode simple.txt", function (done) {
        var data = fixture('simple.txt'),
            res = bencoding.decode(data).toJSON();
        expect(res).to.be.a('object');
        expect(res).to.have.keys('int', 'str', 'list');
        expect(res.int).to.be.a('number');
        expect(+res.int.toString()).to.be(1024768);
        expect(res.str).to.be.a(Buffer);
        assert.deepEqual(res.str, new Buffer('abcde'));
        expect(res.list).to.be.an(Array);
        expect(res.list).to.have.length(3);
        expect(+res.list[0].toString()).to.be(1);
        expect(+res.list[1].toString()).to.be(2);
        expect(+res.list[2].toString()).to.be(3);
        done();
    });
    it("can decode a simple torrent", function (done) {
        var data = fixture('ubuntu.torrent'),
            res = bencoding.decode(data).toJSON();
        done();
    });
    it("Can encode simply", function (done) {
        var data = {
            int: 1024768,
            str: 'abcde',
            list: [1, 2, 3]
        }, res = bencoding.encode(data);

        assert.deepEqual(res.toString(), fixture('simple.txt').toString().trim());
        done();
    });
    it("Can decode and re-encode", function (done) {
        var data = fixture('ubuntu.torrent'),
            res = bencoding.decode(data),
            n = bencoding.encode(res);

        assert.deepEqual(n, data);
        done();
    });
    it("Will yell if the data is malformed", function (done) {
        var data = fixture('bad.txt');

        expect(function () {
            bencoding.decode(data);
        }).to.throwError();
        done();
    });
    it("can decode a http scrape response");
    it("can decode a http announce response");
});
