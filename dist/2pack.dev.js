(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["packer"] = factory();
	else
		root["packer"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((module) => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var XBuffer = typeof Buffer !== 'undefined' ? Buffer : function () {
  var MAX_ARGUMENTS_LENGTH = 0x1000;
  var K_MAX_LENGTH = 0x7fffffff; //---------------------]>

  return function () {
    var Buffer = function Buffer() {}; //--------]>


    Buffer.allocUnsafe = allocUnsafe;
    Buffer.allocUnsafeSlow = allocUnsafe; //--------]>

    return Buffer; //--------]>

    function allocUnsafe(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('Invalid typed array length');
      }

      var buf = new Uint8Array(length);
      buf.write = write;
      buf.toString = toString;
      return buf;
    } //----)>


    function write(string, offset, length) {
      offset = offset || 0;
      length = length || this.length;
      var remaining = this.length - offset;

      if (!length || length > remaining) {
        length = remaining;
      }

      return blitBuffer(utf8ToBytes(string, this.length - offset), this, offset, length);
    }

    function toString(encoding, start, end) {
      start = start || 0;
      end = end || this.length;
      return end === 0 ? '' : utf8Slice(this, start, end);
    }
  }(); //---------------------]>

  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var length = string.length;
    var codePoint;
    var leadSurrogate = null;
    var bytes = new Array();

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i); // is surrogate component

      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) {
              bytes.push(0xEF, 0xBF, 0xBD);
            }

            continue;
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) {
              bytes.push(0xEF, 0xBF, 0xBD);
            }

            continue;
          } // valid lead


          leadSurrogate = codePoint;
          continue;
        } // 2 leads in a row


        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) {
            bytes.push(0xEF, 0xBF, 0xBD);
          }

          leadSurrogate = codePoint;
          continue;
        } // valid surrogate pair


        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) {
          bytes.push(0xEF, 0xBF, 0xBD);
        }
      }

      leadSurrogate = null; // encode utf8

      if (codePoint < 0x80) {
        if ((units -= 1) < 0) {
          break;
        }

        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) {
          break;
        }

        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) {
          break;
        }

        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) {
          break;
        }

        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }

    return bytes;
  }

  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = new Array();
    var i = start;

    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte = void 0,
            thirdByte = void 0,
            fourthByte = void 0,
            tempCodePoint = void 0;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }

            break;

          case 2:
            secondByte = buf[i + 1];

            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }

            break;

          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];

            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }

            break;

          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];

            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }

        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res);
  } //--------)>


  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;

    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
    } // Decode in chunks to avoid 'call stack size exceeded'.


    var res = '';
    var i = 0;

    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }

    return res;
  }
}();

var isBigEndian = function () {
  var a = new Uint32Array([0x12345678]);
  var b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  return b[0] === 0x12;
}(); //-----------------------------------------------------


module.exports = function (schema) {
  var TYPE_BIN = 1;
  var TYPE_STR = 2;
  var TYPE_INT = 4;
  var TYPE_UINT = 8;
  var TYPE_FLOAT = 16;
  var TYPE_JSON = 32; //-----------------]>

  if (schema === null) {
    schema = [];
  }

  if (!schema || !Array.isArray(schema) && typeof schema !== 'string') {
    throw new Error('Invalid schema');
  } //-----------------]>


  var schemaContNames = Array.isArray(schema) ? schema.some(function (e) {
    return e.split(':').length >= 2;
  }) : false;
  var schemaDontContNames = Array.isArray(schema) ? schema.some(function (e) {
    return e.split(':').length < 2;
  }) : true; //-----------------]>

  if (schemaContNames && schemaDontContNames) {
    throw new Error('A schema has mixed names/types');
  } //-----------------]>


  var int64size = typeof BigInt64Array !== 'undefined' ? BigInt64Array.BYTES_PER_ELEMENT : 0;
  var isPrimitive = typeof schema === 'string';
  var schLen = isPrimitive ? 1 : schema.length;
  var fields = new Array(schLen); //---------)>

  var pktDataBuf = null;
  var pktOffset = 0;
  var pktMinSize = 0;
  var pktMaxSize = 0;
  var pktDataHolderArr = new Array();
  var pktDataHolderObj = Object.create(null); //-----------------]>

  for (var i = 0; i < schLen; ++i) {
    var _ref = isPrimitive ? [schema, ''] : schema[i].split(':').reverse(),
        _ref2 = _slicedToArray(_ref, 2),
        subType = _ref2[0],
        name = _ref2[1];

    var type = getTypeId(subType.replace(/[\d\[\]]/g, ''));
    var size = parseInt(subType.replace(/\D/g, ''), 10) || 0;

    var _buildTypedBuf = buildTypedBuf(type, size),
        _buildTypedBuf2 = _slicedToArray(_buildTypedBuf, 3),
        bytes = _buildTypedBuf2[0],
        // BYTES_PER_ELEMENT
    bufType = _buildTypedBuf2[1],
        // dataView
    bufAType // dataSizeView
    = _buildTypedBuf2[2];

    var bufBytes = (type & TYPE_STR) === TYPE_STR || (type & TYPE_BIN) === TYPE_BIN ? null : new Uint8Array(bufType.buffer);
    var bufABytes = bufAType ? new Uint8Array(bufAType.buffer) : null; //---------]>

    fields[i] = [name, type, bytes, bufType, bufBytes, bufAType, bufABytes];
    pktMinSize += bytes;
    pktMaxSize += bufType.byteLength;
  }

  offset(0); //-----------------]>

  return {
    get minSize() {
      return pktMinSize;
    },

    get maxSize() {
      return pktMaxSize;
    },

    get offset() {
      return pktOffset;
    },

    set offset(value) {
      offset(value);
    },

    pack: pack,
    unpack: unpack
  }; //-----------------]>

  function offset(value) {
    value = parseInt(value, 10) || 0;
    pktMinSize = pktMinSize - pktOffset + value;
    pktMaxSize = pktMaxSize - pktOffset + value;
    pktOffset = value;
    pktDataBuf = XBuffer.allocUnsafeSlow(pktMaxSize);
  } //------)>

  /**
   *
   * @param {(Array|Object)} data
   * @param {(undefined|Buffer)} target
   * @returns {(Buffer)} Browser Buffer - Uint8Array
   */


  function pack(data, target) {
    var isArray = Array.isArray(data);
    var outTg = !!target;
    var fieldIdx = schLen;
    var pktSize = pktOffset;
    var input = data;
    var field;
    var name, type, bytes, bufType, bufBytes, bufAType, bufABytes; //--------]>

    target = target || pktDataBuf; //--------]>

    while (fieldIdx--) {
      field = fields[fieldIdx];
      var _field = field;

      var _field2 = _slicedToArray(_field, 7);

      name = _field2[0];
      type = _field2[1];
      bytes = _field2[2];
      bufType = _field2[3];
      bufBytes = _field2[4];
      bufAType = _field2[5];
      bufABytes = _field2[6];

      //------]>
      if (!isPrimitive && data) {
        input = data[isArray ? fieldIdx : name];
      } //------]>


      if ((type & TYPE_STR) === TYPE_STR || (type & TYPE_BIN) === TYPE_BIN) {
        if ((type & TYPE_JSON) === TYPE_JSON) {
          input = JSON.stringify(input);
        }

        if (input) {
          bytes += bufAType[0] = (type & TYPE_BIN) === TYPE_BIN ? blitBuffer(input, target, pktSize + bytes, bufType.byteLength - bytes) : target.write(input, pktSize + bytes, bufType.byteLength - bytes);

          if (isBigEndian) {
            target[pktSize] = bufABytes[1];
            target[pktSize + 1] = bufABytes[0];
          } else {
            target[pktSize] = bufABytes[0];
            target[pktSize + 1] = bufABytes[1];
          }

          pktSize += bytes;
        } else {
          target[pktSize] = 0;
          target[pktSize + 1] = 0;
          pktSize += 2;
        }
      } else {
        var zeroValue = 0;

        if (bytes === int64size) {
          zeroValue = BigInt('0');
        }

        if (input == null || typeof input !== 'bigint' && (isNaN(input) || !isFinite(input))) {
          bufType[0] = zeroValue;
        } else {
          bufType[0] = input;

          if (isBigEndian && bufType.byteLength > 1) {
            bufBytes.reverse();
          }
        }

        var tIdx = 0;

        while (tIdx < bytes) {
          target[pktSize] = bufBytes[tIdx];
          ++pktSize;
          ++tIdx;
        }
      }
    } //--------]>


    return !outTg && pktSize < pktMaxSize ? target.slice(0, pktSize) : target;
  }
  /**
   *
   * @param {(Uint8Array|Buffer)} bin
   * @param {number} offset
   * @param {number} length
   * @param {Function} cbEndInfo
   * @param {(Array|Object)} target
   * @param {boolean} asCopy
   * @param {boolean} asArray
   * @returns {(undefined|null|Array|Object)}
   */


  function unpack(bin, offset, length, cbEndInfo, target) {
    var asCopy = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
    var asArray = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

    if (!schLen) {
      if (cbEndInfo) {
        cbEndInfo(pktOffset);
      }

      return null;
    } //--------]>


    if (!bin || _typeof(bin) !== 'object' || bin.byteLength < pktMinSize) {
      return undefined;
    }

    if (schemaDontContNames) {
      asArray = true;
    }

    if (!isPrimitive) {
      target = target || (asCopy ? asArray ? new Array() : Object.create(null) : asArray ? pktDataHolderArr : pktDataHolderObj);
    } //--------]>


    var fieldIdx = schLen;
    var curOffset = offset + pktOffset;
    var pktOffsetStart = curOffset; //--------]>

    while (fieldIdx--) {
      var field = void 0;

      var _fields$fieldIdx = _slicedToArray(fields[fieldIdx], 7),
          _name = _fields$fieldIdx[0],
          _type = _fields$fieldIdx[1],
          _bytes = _fields$fieldIdx[2],
          _bufType = _fields$fieldIdx[3],
          _bufBytes = _fields$fieldIdx[4],
          _bufAType = _fields$fieldIdx[5],
          _bufABytes = _fields$fieldIdx[6]; //------]>


      for (var _i2 = 0; _i2 < _bytes; ++_i2) {
        if (curOffset >= length) {
          return undefined;
        }

        if (_bufAType) {
          _bufABytes[_i2] = bin[curOffset];
        } else {
          _bufBytes[_i2] = bin[curOffset];
        }

        ++curOffset;
      } //------]>


      if ((_type & TYPE_STR) === TYPE_STR || (_type & TYPE_BIN) === TYPE_BIN) {
        if (isBigEndian) {
          _bufABytes.reverse();
        } //--------]>


        var byteLen = _bufAType[0]; //--------]>

        if (!byteLen) {
          field = (_type & TYPE_BIN) === TYPE_BIN || (_type & TYPE_JSON) === TYPE_JSON ? null : '';
        } else if (byteLen >= length || byteLen > _bufType.byteLength) {
          return undefined;
        } else {
          if ((_type & TYPE_BIN) === TYPE_BIN) {
            var buf = XBuffer.allocUnsafeSlow(byteLen);

            for (var _i3 = 0; _i3 < byteLen; ++_i3, ++curOffset) {
              buf[_i3] = bin[curOffset];
            }

            field = buf;
          } else {
            if (bin instanceof XBuffer) {
              field = bin.toString('utf8', curOffset, curOffset + byteLen);
            } else if (XBuffer.from) {
              field = XBuffer.from(bin).toString('utf8', curOffset, curOffset + byteLen);
            } else if (typeof TextDecoder !== 'undefined') {
              field = new TextDecoder().decode(bin.slice(curOffset, curOffset + byteLen).buffer);
            } else {
              field = _bufType.toString.call(bin, 'utf8', curOffset, curOffset + byteLen);
            }

            curOffset += byteLen;
          }

          if ((_type & TYPE_JSON) === TYPE_JSON) {
            try {
              field = JSON.parse(field);
            } catch (e) {
              field = null;
            }
          }
        }
      } else {
        if (isBigEndian && _bufType.byteLength > 1) {
          _bufBytes.reverse();
        }

        field = _bufType[0];
      } //------]>


      if (isPrimitive) {
        target = field;
      } else {
        if (asArray) {
          _name = fieldIdx;
        }

        target[_name] = field;
      }
    }

    if (cbEndInfo) {
      cbEndInfo(pktOffset + curOffset - pktOffsetStart);
    } //--------]>


    return target;
  } //-----------------]>


  function buildTypedBuf(type, size) {
    if ((type & TYPE_BIN) === TYPE_BIN) {
      return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 1024) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
    }

    if ((type & TYPE_JSON) === TYPE_JSON) {
      return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 8192) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
    }

    if ((type & TYPE_STR) === TYPE_STR) {
      return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 256) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
    }

    switch (type) {
      case TYPE_INT:
        switch (size) {
          case 8:
            return [Int8Array.BYTES_PER_ELEMENT, new Int8Array(1)];

          case 16:
            return [Int16Array.BYTES_PER_ELEMENT, new Int16Array(1)];

          case 32:
            return [Int32Array.BYTES_PER_ELEMENT, new Int32Array(1)];

          case 64:
            return [BigInt64Array.BYTES_PER_ELEMENT, new BigInt64Array(1)];

          default:
            throw new Error("Unknown size: ".concat(size, " | ").concat(type));
        }

      case TYPE_UINT:
        switch (size) {
          case 8:
            return [Uint8Array.BYTES_PER_ELEMENT, new Uint8Array(1)];

          case 16:
            return [Uint16Array.BYTES_PER_ELEMENT, new Uint16Array(1)];

          case 32:
            return [Uint32Array.BYTES_PER_ELEMENT, new Uint32Array(1)];

          case 64:
            return [BigUint64Array.BYTES_PER_ELEMENT, new BigUint64Array(1)];

          default:
            throw new Error("Unknown size: ".concat(size, " | ").concat(type));
        }

      case TYPE_FLOAT:
        switch (size) {
          case 32:
            return [Float32Array.BYTES_PER_ELEMENT, new Float32Array(1)];

          case 64:
            return [Float64Array.BYTES_PER_ELEMENT, new Float64Array(1)];

          default:
            throw new Error("Unknown size: ".concat(size, " | ").concat(type));
        }

      default:
        throw new Error("Unknown type: ".concat(type, " | ").concat(type));
    }
  }

  function getTypeId(type) {
    switch (type) {
      case 'b':
      case 'bin':
        return TYPE_BIN;

      case 'j':
      case 'json':
        return TYPE_STR | TYPE_JSON;

      case 's':
      case 'str':
        return TYPE_STR;

      case 'i':
      case 'int':
        return TYPE_INT;

      case 'u':
      case 'uint':
        return TYPE_UINT;

      case 'f':
      case 'float':
        return TYPE_FLOAT;

      default:
        throw new Error("Unknown type: ".concat(type));
    }
  }
}; //---]>


Object.assign(module.exports, {
  get isBE() {
    return isBigEndian;
  },

  get isLE() {
    return !isBigEndian;
  }

}); //-----------------------------------------------------

function blitBuffer(src, dst, offset, length) {
  if (!length) {
    return 0;
  } //-------]>


  var dstLen = dst.length;
  var srcLen = src.length;
  var i, t; //-------]>

  for (i = 0; i < length; ++i) {
    t = i + offset;

    if (t >= dstLen || i >= srcLen) {
      break;
    }

    dst[t] = src[i];
  } //-------]>


  return i;
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=2pack.dev.js.map