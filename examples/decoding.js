var bencoding = require('../'),
	data = new Buffer('d3:inti1024768e3:str5:abcde4:listli1ei2ei3eee'),
	result = bencoding.decode(data);

console.log(result);
console.log(result.toJSON());
