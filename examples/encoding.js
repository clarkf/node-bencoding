var bencoding = require('../'),
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
