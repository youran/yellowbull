/* yellowbull_post.js by youran.me, 20160820 */

const https = require('https');
const querystring = require('querystring');
const zlib = require('zlib');

// Download pushbullet from:
// https://play.google.com/store/apps/details?id=com.pushbullet.android&referrer=utm_source%3Dpushbullet.com
var token = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';

var pushData = querystring.stringify({
	'type': 'link',
	'title': 'In Stock',
	'body': 'Your VPS is in stock NOW!',
	'url': 'https://clients.budgetnode.com/cart.php?a=add&pid=18'
});

var postData = querystring.stringify({
	'token': '1973d3329925dda31abb6605a3aa5790cf071e19',
	'promocode': 'DOUBLEDISK',
	'validatepromo': 'Validate Code'
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
	hostname: 'clients.budgetnode.com',
	port: '443',
	path: '/cart.php?a=view',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': Buffer.byteLength(postData),
		'origin': 'https://clients.budgetnode.com',
		'Referer': 'https://clients.budgetnode.com/cart.php?a=view',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
		'Accept-Encoding': 'gzip, deflate',
		'Accept-Language': 'en-US,en;q=0.8',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Cookie': '__cfduid=d5ce2a41b43fc2b9ef817bc90dce147cc1470494161; WHMCSWykKh4PaBxAp=utlstrikc5mfqj5f60o8hvcgc0'
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
	if (buf.includes('Promotion Code Accepted')) {
		console.log('IN STOCK!!!');
		pushMsg();
	} else {
		console.log('Try again later');
	}
};

// try every 3 minutes
setInterval(() => {
	let req = https.request(options, (res) => {
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

	req.write(postData);
	req.end();
}, 180000);