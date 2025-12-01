// Node dependencies
const { parseArgs } = require('node:util');
const {DatabaseSync} = require('node:sqlite');
const fs = require('fs');
const util = require('util');

// External dependencies
const xml = require('./parse-xml');

// Internal dependencies
const parsePlist = require('./plist');
const parseZDATA = require('./zdata');

const options = {
  help: {
    type: 'boolean',
    short: 'h',
  },
  write: {
    type: 'boolean',
    short: 'w',
  },
  beautify: {
    type: 'boolean',
    short: 'b',
  },
};


const {values, positionals} = parseArgs({options, allowPositionals: true});

if (positionals.length === 0 || values.help) {
  console.error('node convert.js file.fcpevent');
  console.log(values, positionals);
  process.exit(1);
}

function replacer(key, value) {
  if (value instanceof Uint8Array) {
    return [...value];
  }
  return value;
}

function log(object, path) {
  const value = values.beautify ?
    util.inspect(object, false, null, !values.write && process.stdout.isTTY /* enable colors */)
  : JSON.stringify(object, null, 2);

  if (values.write) {
    const newPath = path + (values.beautify ? '.js' : '.json');
    fs.writeFileSync(newPath, value);
    console.log('Wrote ' + newPath);
  } else {
    console.log(value);
  }
}

positionals.forEach(path => {
  if (path.endsWith('.plist')) {
    const info = fs.readFileSync(path, 'utf8');
    const infoJSON = xml.parseXml(info).toJSON();
    const plist = parsePlist(infoJSON.children[0].children[1]);
    log(plist, path);

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
    log(json, path);
  }
});
