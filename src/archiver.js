module.exports = function parseArchiver(plist) {
	if (!plist || !plist[0] || plist[0].$archiver !== 'NSKeyedArchiver') {
		return plist;
	}

	const obj = plist[0];
	const rootID = obj.$top.root.UID;
	const $objects = obj.$objects;
	function parseElement(element) {
		if (typeof element !== 'object' || !element.$class) {
			return element;
		}
		const $class = $objects[element.$class.UID];
		const $classname = $class.$classname;
		if ($classname === 'NSMutableDictionary' || $classname === 'NSDictionary') {
			const result = {};
			for (let i = 0; i < element['NS.objects'].length; ++i) {
				const key = $objects[element['NS.keys'][i].UID];
				const value = $objects[element['NS.objects'][i].UID];
				result[key] = parseElement(value);
			}
			return result;
		} else if ($classname === 'NSArray' || $classname === 'NSSet' || $classname === 'NSMutableArray') {
			const result = [];
			for (let i = 0; i < element['NS.objects'].length; ++i) {
				const value = $objects[element['NS.objects'][i].UID];
				result[i] = parseElement(value);
			}
			return result;
		} else if ($classname === 'NSNull') {
			return null;
		} else if ($classname === 'FFMD5AndOffset') {
			const {$class: _, ...rest} = element;
			return {
				...rest,
				useBaseMD5Only: parseElement(element.useBaseMD5Only),
				combMD5: parseElement($objects[element.combMD5.UID]),
			};
		} else if ($classname === 'FFEventInfo') {
			const {$class: _, ...rest} = element;
			return {
				...rest,
				eventEarliestDate: parseElement($objects[element.eventEarliestDate.UID]),
				modDate: parseElement($objects[element.modDate.UID]),
				eventLatestDate: parseElement($objects[element.eventLatestDate.UID]),
				eventLastImportDate: parseElement($objects[element.eventLastImportDate.UID]),
				totalClipDuration: parseElement($objects[element.totalClipDuration.UID]),
			};
		} else if ($classname === 'NSDate') {
			const {$class: _, 'NS.time': __, ...rest} = element;
			return {
				...rest,
				time: element['NS.time']
			};
		} else if ($classname === 'NSMutableIndexSet') {
			// https://github.com/swiftlang/swift-corelibs-foundation/blob/main/Sources/Foundation/NSIndexSet.swift#L110
			if (element.NSRangeCount === 0) {
				return [];
			} else if (element.NSRangeCount === 1) {
				const result = [];
				for (let i = 0; i < element.NSLength; ++i) {
					result.push(element.NSLocation + i);
				}
				return result;
			} else {
				const result = [];
				const data = getPackedUnsignedIntegers($objects[element.NSRangeData.UID]['NS.data'])
				for (let i = 0; i < data.length; i += 2) {
					const location = data[i];
					const length = data[i + 1];
					for (let j = 0; j < length; ++j) {
						result.push(location + j);
					}
				}
				return result;
			}
		} else if ($classname === 'FigTimeRangeObj') {
			const start = parseElement($objects[element.start.UID]);
			const duration = parseElement($objects[element.duration.UID]);
			return {start, duration};
		} else if ($classname === 'FigTimeObj') {
			const {$class: _, ...rest} = element;
			return {
				...rest,
			};
		}
		console.error('Cannot parse', $classname, element);
		return element;
	}

	return parseElement($objects[rootID]);
}

// https://github.com/swiftlang/swift-corelibs-foundation/blob/main/Sources/Foundation/NSIndexSet.swift#L892
function getPackedUnsignedIntegers(data) {
  const result = [];
  let index = 0;

  while (index < data.length) {
    let value = 0;
    let shift = 1;

    while (index < data.length) {
      const byte = data[index];
      index++;

      if (byte < 128) {
        value += byte * shift;
        break;
      } else {
        value += (byte - 128) * shift;
        shift *= 128;
      }
    }

    result.push(value);
  }

  return result;
}
