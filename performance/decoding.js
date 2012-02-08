var Benchmark = require('benchmark'),
	bencoding = require('../lib/bencoding'),
	bencode = require('bencode'),
	bncode = require('bncode'),
	dht = require('dht-bencode'),

	data = require('fs').readFileSync(__dirname + '/../test/support/ubuntu.torrent');

var suite = new Benchmark.Suite;

suite.add("bencoding#decode", function () {
	bencoding.decode(data);
});
suite.add("bencode#decode", function () {
	bencode.decode(data.toString());
});
suite.add("bncode#decode", function () {
	bncode.decode(data);
});
suite.add("dht-bencode#decode", function () {
	dht.bdecode(data.toString());
});

suite.on('cycle', function (event, bench) {
	console.log(String(bench));
});
suite.on('complete', function (event, bench) {
	console.log('Fastest is ' + this.filter('fastest').pluck('name'));	
});

suite.run();
