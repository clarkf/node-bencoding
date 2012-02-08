var expect = require('expect.js'),
    assert = require('assert'),
    crypto = require('crypto'),
    fs = require('fs'),
    bencoding = require('../lib/bencoding');

function fixture(name) {
    return fs.readFileSync(__dirname + "/support/" + name);
};

function shasum(val) {
    var hasher = crypto.createHash('sha1');
    hasher.update(val);
    return new Buffer(hasher.digest('binary'), 'binary');
};

describe("Decoding", function () {
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
        }).to.throwError(function (e) {
            console.log(e);
        });
        done();
    });
    it("can decode a http tracker response");
});
