var Memcached =  require('memcached')
var md5 = require('md5')
var async = require('async')
var request = require('request')
var fs = require('fs')

var wmem = new Memcached(
	'127.0.0.1:11211'
)

function getIfeed (symbol, cb) {
	var keyraw = 'ifeed_' + symbol
	var keyifeed = md5(keyraw.toLowerCase())
	wmem.get(keyifeed, function (err, data) {
		if(err) {
			return console.error(err)
		}
		console.log("Data >> ", data)
		return cb(null, data)
	})
}
function getIfeedCurried (symbol) {
	return function (cb) {
		return getIfeed(symbol, cb)
	}
}
console.log(' -->> start request ')
request('http://127.0.0.1/stockbit/api/company', function (error, response, body) {
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
			// console.log(err)
			// // console.log(data)
			// // return 
			// var stringify = '';
			// // var buffer = []
			// data.map(function (i) {
			// 	// console.log(i, 'type of ehhe ')
			// 	// console.log(typeof i)

			// 	// console.log(i == undefined)
			// 	if(i == undefined) {
			// 		console.log(i)
			// 	} else {
			// 		stringify += i + ','					
			// 	}
			// })

			// stringify = stringify.replace(/,\s*$/, "");
			// stringify = '[' + stringify + ']'

			// var tiddy = JSON.stringify(JSON.parse(stringify), null, 2)

		})
	}
})
