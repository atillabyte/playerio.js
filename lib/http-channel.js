/* @flow */

import http from 'http';
import messages from './models/protobuf-messages';
import converter from './helpers/converter';

const HOST = 'api.playerio.com';
const BASE_PATH = '/api/';

export default class HttpChannel {
	constructor(playerToken) {
		this.playerToken = playerToken;
	}

	request(method, request, successMessage, successCallback, errorCallback) {
		// Always use PlayerIOError as an errorMessage
		this.customRequest(method, request, successMessage, messages.PlayerIOError, successCallback, function (err) {
			errorCallback(converter.toPlayerIOError(err));
		})
	}

	customRequest(method, request, successMessage, errorMessage, successCallback, errorCallback) {
		let options = {
			host: HOST,
			path: BASE_PATH + method,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'playertoken': this.playerToken
			}
		}

		let req = http.request(options, function (res) {
			let data = [];
			res.on('data', function (obj) {
				data.push(obj);
			});

			res.on('end', function () {
				let buffer = Buffer.concat(data);
				res = HttpChannel._readHead(buffer);
				if (res.success) {
					successCallback(successMessage.decode(buffer, res.offset));
				} else {
					errorCallback(errorMessage.decode(buffer, res.offset));
				}
			});
		});

		req.write(request);
		req.end();
	}

	static _readHead(buffer) {
		let pointer = 0;
		let hasToken = buffer.readInt8(pointer++);

		if (hasToken === 1) {
			let length = buffer.readInt16BE(pointer);
			pointer += 2;
			playerToken = buffer.toString('utf-8', pointer, length);
			pointer += length;
		}

		return {
			success: buffer.readInt8(pointer++) === 1,
			offset: pointer
		};
	}
}

HttpChannel.default = new HttpChannel('');