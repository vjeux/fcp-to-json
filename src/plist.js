const util = require('util');
const bplist = require('./bplist');
const parseArchiver = require('./archiver');

module.exports = function parsePlist(xml) {
	if (xml.name === 'dict') {
		const result = {};
		let key = null;
		let value = null;
		for (let i = 0; i < xml.children.length; ++i) {
			const child = xml.children[i];
			if (child.type === 'text') {
				continue;
			}
			if (child.name === 'key') {
				key = child.children[0].text;
				continue;
			}
			value = parsePlist(child);
			result[key] = value;
		}
		return result;
	}
	if (xml.name === 'array') {
		const result = [];
		for (let i = 0; i < xml.children.length; ++i) {
			const child = xml.children[i];
			if (child.type === 'text') {
				continue;
			}
			result.push(parsePlist(child));
		}
		return result;
	}
	if (xml.name === 'real') {
		return parseFloat(xml.children[0].text);
	}
	if (xml.name === 'integer') {
		return parseInt(xml.children[0].text, 10);
	}
	if (xml.name === 'string') {
		return xml.children[0].text;
	}
	if (xml.name === 'data') {
		const data = Buffer.from(xml.children[0].text.replace(/[\n\t ]/g, ''), 'base64');
		if (data.toString('ascii').startsWith('bplist')) {
			return parseArchiver(bplist.parseBuffer(data));
		}
		return data;
	}
	return '??? ' + JSON.stringify(xml);
}
