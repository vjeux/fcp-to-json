// Node dependencies
const { parseArgs } = require('node:util');
const {DatabaseSync} = require('node:sqlite');
const fs = require('fs');
const util = require('util');

// Internal dependencies
const parsePlist = require('./plist');
const parseZDATA = require('./zdata');

const options = {
  help: {
    type: 'boolean',
    short: 'h',
  },
  beautify: {
    type: 'boolean',
    short: 'b',
  },
};


const {values, positionals} = parseArgs({options, allowPositionals: true});

if (positionals.length !== 1 || values.help) {
  console.error('node convert.js file.fcpevent');
  process.exit(1);
}

function replacer(key, value) {
  if (value instanceof Uint8Array) {
    return [...value];
  }
  return value;
}

function log(object) {
  if (values.beautify) {
    console.log(util.inspect(object, false, null, process.stdout.isTTY /* enable colors */));
  } else {
    console.log(JSON.stringify(object, null, 2));
  }
}

const path = positionals[0];
if (path.endsWith('.plist')) {
  const info = fs.readFileSync(path, 'utf8');
  const infoJSON = xml.parseXml(info).toJSON();
  const plist = parsePlist(infoJSON.children[0].children[1]);
  log(plist);
  process.exit(0);

} else if (path.endsWith('.fcpevent') || path.endsWith('.flexolibrary')) {
  const db = new DatabaseSync(path);

  const json = {
    ZCATALOGROOT: parseZDATA(db, 'ZCATALOGROOT'),
    ZCOLLECTION: parseZDATA(db, 'ZCOLLECTION'),
    Z_3CHILDCOLLECTIONS: parseZDATA(db, 'Z_3CHILDCOLLECTIONS'),
    Z_METADATA: parseZDATA(db, 'Z_METADATA'),
    Z_MODELCACHE: parseZDATA(db, 'Z_MODELCACHE'),
    Z_PRIMARYKEY: parseZDATA(db, 'Z_PRIMARYKEY'),
  };
  log(json);
  process.exit(0);

} else {
  console.error('Unknown file type ' + path);
  process.exit(1);
}