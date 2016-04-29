var Memcached =  require('memcached')
var md5 = require('md5')
var async = require('async')
var request = require('request')
var fs = require('fs')

var wmem = new Memcached(
	'127.0.0.1:11211'
)

function readFile (path, cb) {
	fs.readFile(path, 'utf8', function (err, data) {
		cb(err, data)
	})
}

function curryWriteData (data) {
	return function (cb) {
		return writeDataToMem(data, cb)
	}
}

function writeDataToMem (v, cb) {
	var _key = 'ifeed_' + v.stock_code
	var _rawkey = md5(_key.toLowerCase())
	var _data = JSON.stringify(v)
	wmem.set(_rawkey, _data, 0, function (err) {
		console.log('done write ', _rawkey)
		cb(err)
	});
}

function main () {
	// var que = []
	// que.push(function (cb) {
	// 	var path = 'data.json'
	// 	return readFile(path, cb)
	// })
	// que.push(function (cb) {

	// })
	// async.series(que, function() {})
	var path = 'data.json'
	readFile(path, function (err, data) {
		if(err){
			return console.error(err)
		}
		var _json = JSON.parse(data)
		var que = []
		_json.map(function (v) {
			que.push(curryWriteData(v))
		})
		async.parallel(que, function (err, data) {
			if(err) {
				return console.error(err)
			}
			console.log(' -- done writing to memcached -- ')
		})
	}) 
}

main()