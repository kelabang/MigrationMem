var Memcached =  require('memcached')
var md5 = require('md5')
var async = require('async')
var request = require('request')
var fs = require('fs')

var memread = new Memcached(
	'127.0.0.1:11211'
)
]var memwrite = new Memcached(
	'127.0.0.1:11211'
)

// mem.connect( '192.168.0.103:11211', function( err, conn ){
//   if( err ) throw new Error( err );
//   console.log( conn.server );
// });

function getIfeed (symbol, cb) {
	var keyraw = 'ifeed_' + symbol
	var keyifeed = md5(keyraw.toLowerCase())
	memread.get(keyifeed, function (err, data) {
		if(err) {
			return console.error(err)
		}
		// console.log("Data >> ", data)
		return cb(null, data)
	})
}

function getIfeedCurried (symbol) {
	return function (cb) {
		return getIfeed(symbol, cb)
	}
}

function writeDataToFile (data, cb) {
	// var writeStream = fs.createWriteStream('./memcached-kev.csv')
	// var readStream = fs.createReadStream(data)
	// readstream.pipe(writeStream)
	try{
		console.log(data)
		// return 
		// var jsonFile = JSON.stringify(data)
		// console.log(jsonFile)
		// return 
		fs.writeFile('data.json', data, function(err) {
			console.error(err)
			cb(err)
		})
	}
	catch(err) {
		console.error(err)
	}
}

function writeDataToMemcache (symbol, data, cb) {
	var keyraw = 'ifeed_' + symbol
	var keyifeed = md5(keyraw.toLowerCase())
	memwrite.set(keyifeed, data, 0, cb)
}

function readJsonFromFile (path, cb) {
	try{
		fs.readFile(path, 'utf8', function (err, data) {
			// console.log(err)
			// console.log(data)
			var dataJson = JSON.parse(data)
			cb(err, dataJson)
		})
	}
	catch(err) {
		cb(err)
	}
}

request('http://localhost/stockbit/api/company', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var body = JSON.parse(body)
		var que = []
		var que_batch = []
		var batch = 5
		console.log(' length of symbol >> ' + body.data.length)
		body.data.map(function (i) {
			que.push(getIfeedCurried(i.company_symbol))
		})
		console.log(" procedure ready to execute >> " + que.length)
		async.parallel(que, function(err, data) {
			console.log(' >> after parallel done')
			console.log(err)
			// console.log(data)
			// return 
			var stringify = '';
			// var buffer = []
			data.map(function (i) {
				// console.log(i, 'type of ehhe ')
				// console.log(typeof i)

				// console.log(i == undefined)
				if(i == undefined) {
					console.log(i)
				} else {
					stringify += i + ','					
				}
			})

			stringify = stringify.replace(/,\s*$/, "");
			stringify = '[' + stringify + ']'

			var tiddy = JSON.stringify(JSON.parse(stringify), null, 2)

			writeDataToFile(tiddy, function (err, data) {

				console.log('>> done write data to file')
				// readJsonFromFile('./data.json', function (err, data) {
				// 	data.map(function (i) {
				// 		console.log(typeof i)
				// 		console.log(i.stock_code)
				// 		// console.log(i)
				// 		writeDataToMemcache(i.stock_code, i, function (err, data) {
				// 			console.log('-- registered')
				// 		})
				// 	})
				// })
			})
		})
	}
})

console.log('-- debug index js --')

// mem.gets('ifeed_')