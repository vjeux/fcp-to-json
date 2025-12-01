// Node dependencies
const fs = require('fs');
const util = require('util');

// External dependencies
const bplist = require('./bplist');
const xml = require('./parse-xml');

// Internal dependencies
const parsePlist = require('./plist');
const parseZDATA = require('./zdata');

function expandedLog(object) {
	console.log(util.inspect(object, false, null, true /* enable colors */))
}

function jsonLog(object) {
	console.log(JSON.stringify(object, null, 2));
}

const fcpBundlePath = __dirname + '/../fcp-to-json.fcpbundle';

function plistFromFile(file) {
	const info = fs.readFileSync(file, 'utf8');
	const infoJSON = xml.parseXml(info).toJSON();
	const plist = parsePlist(infoJSON.children[0].children[1]);
	return plist;
}

// expandedLog( // all the .plist
// 	fs.readdirSync(fcpBundlePath, { recursive: true })
// 		.filter(file => !file.includes('.fcpcache'))
// 		.filter(file => file.endsWith('.plist'))
// 		.map(file => fcpBundlePath + '/' + file)
// 		.map(file => [file, plistFromFile(file)])
// );


const {DatabaseSync} = require('node:sqlite');
const dbpath = fcpBundlePath + '/11-30-25/CurrentVersion.fcpevent';
console.log(dbpath);
const db = new DatabaseSync(dbpath);

// expandedLog( // Z_METADATA
// 	db.prepare(`SELECT * FROM Z_METADATA`)
// 		.all()
// 		.map(metadata => {
// 			const result = bplist.parseUint(metadata.Z_PLIST);
// 			result.forEach(entry => {
// 				entry.NSStoreModelVersionHashesDigest = Buffer.from(entry.NSStoreModelVersionHashesDigest, 'base64');
// 				entry.NSStoreModelVersionChecksumKey = Buffer.from(entry.NSStoreModelVersionChecksumKey, 'base64');
// 			})
// 			return result;
// 		})[0]
// );

// const zcatalogroot = parseZDATA(db, 'ZCATALOGROOT');
// expandedLog(zcatalogroot[0].metadata.ZDICTIONARYDATA);


const zcollection = parseZDATA(db, 'ZCOLLECTION');
// const rootID = parseZDATA(db, 'ZCATALOGROOT')[0].metadata.ZDICTIONARYDATA.$rootObjectID;
// const rootObject = zcollection.find(item => item.ZIDENTIFIER === rootID);

// const projectDataID = rootObject.metadata.ZDICTIONARYDATA.projectDataID;
// const projectData = zcollection.find(item => item.ZIDENTIFIER === projectDataID);

// expandedLog(rootObject);

expandedLog(zcollection.filter(item => item.ZTYPE === 'FFMediaRep'));


