/* yellowbull_get.js by youran.me, 20160820 */

const https = require('https');
const querystring = require('querystring');
const zlib = require('zlib');

// Download pushbullet from:
// https://play.google.com/store/apps/details?id=com.pushbullet.android&referrer=utm_source%3Dpushbullet.com
var token = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';

var pushData = querystring.stringify({
	'type': 'link',
	'title': 'In Stock',
	'body': 'Your Kimsufi is in stock NOW!',
	'url': 'https://www.kimsufi.com/en/order/kimsufi.cgi?hard=160sk32'
});

var pushOpts = {
	hostname: 'api.pushbullet.com',
	port: '443',
	path: '/v2/pushes',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': Buffer.byteLength(pushData),
		'Access-Token': token
	}
};

var options = {
	hostname: 'www.kimsufi.com',
	port: '443',
	path: '/en/order/kimsufi.cgi?hard=160sk32',
	method: 'GET',
	headers: {
		'Connection': 'keep-alive',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
		'Accept-Encoding': 'gzip, deflate',
		'Accept-Language': 'en-US,en;q=0.8',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Cookie': 'ksCookieAccepted=true; cookieAccepted=true; KS_MANAGER_TRACE=%7B%22services%22%3A%7B%22server%22%3A1%7D%2C%22date%22%3A%222016-08-13T09%3A42%3A16%2B08%3A00%22%7D; OVHSESSIONID=dc43b0b415089b802873a4f1465123a4; ovhnewOrder=%7B%22hard%22%3A%22160sk32%22%2C%22sessionId%22%3A%22dc43b0b415089b802873a4f1465123a4%22%7D; slb=R2649492292; OVHCDN=R1837866928'
	}
};

var pushMsg = () => {
	let req = https.request(pushOpts, (res) => {
		req.on('error', (e) => {
			console.log(`Error: ${e.message}`);
		});
	});

	req.write(pushData);
	req.end();
};

var getResult = (buf) => {
	//console.log(buf.toString());
	if (buf.includes('I would appreciate delivery')) {
		console.log('IN STOCK!!!');
		pushMsg();
	} else {
		console.log('Try again later');
	}
};

// try every 3 minutes
setInterval(() => {
	let req = https.get(options, (res) => {
		//console.log(`STATUS: ${res.statusCode}`);
		//console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		let bufs = [];
		res.on('data', (chunk) => {
			bufs.push(chunk);
		});
		res.on('end', () => {
			let bufConcat = Buffer.concat(bufs);
			switch (res.headers['content-encoding']) {
				case 'gzip':
				case 'deflate':
					zlib.unzip(bufConcat, (err, buf) => {
						getResult(buf);
					});
					break;
				default:
					getResult(bufConcat);
					break;
			}
		});
		req.on('error', (e) => {
			console.log(`Error: ${e.message}`);
		});
	});
}, 180000);