var Benchmark = require('benchmark'),
	bencoding = require('../lib/bencoding'),
	bencode = require('bencode'),
	bncode = require('bncode'),
	dhtBencode = require('dht-bencode'),

	data = {
		int: 12345678,
		str: "hello world",
		list: [1, 2, 3, 4, 5]
	};

var suite = new Benchmark.Suite;

suite.add("bencoding#encode", function () {
	bencoding.encode(data);
});
suite.add("bencode#encode", function () {
	bencode.encode(data.toString());
});
suite.add("bncode#encode", function () {
	bncode.encode(data);
});
suite.add("dht-bencode#encode", function () {
	dhtBencode.bencode(data.toString());
});

suite.on('cycle', function (event, bench) {
	console.log(String(bench));
});
suite.on('complete', function (event, bench) {
	console.log('Fastest is ' + this.filter('fastest').pluck('name'));	
});

suite.run();
