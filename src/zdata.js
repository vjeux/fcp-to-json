const parseArchiver = require('./archiver');
const bplist = require('./bplist');

function getAll(db, sql) {
	return db.prepare(sql).all().map(entry => ({...entry}));
}

module.exports = function parseZDATA(db, name) {
  const zdata = getAll(db, `SELECT * FROM ${name}`);

  if (name === 'ZCATALOGROOT' || name === 'ZCOLLECTION') {    
  	const zdatamd = getAll(db, `SELECT * FROM ${name}MD`);

  	const zdatamdIndex = {};
  	zdatamd.forEach(entry => {
  		zdatamdIndex[entry.Z_PK] = entry;
  		entry.ZDICTIONARYDATA = parseArchiver(bplist.parseUint(entry.ZDICTIONARYDATA));
  	});
  	zdata.forEach(entry => {
  		if (entry.ZMETADATA) {
  			entry.metadata = zdatamdIndex[entry.ZMETADATA];
  		}
  	});
  } else if (name === 'Z_METADATA') {
    zdata.forEach(entry => {
      entry.Z_PLIST = parseArchiver(bplist.parseUint(entry.Z_PLIST));
    });
  }

  return zdata;
}
