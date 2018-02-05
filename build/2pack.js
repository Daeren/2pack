"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var packer = function (module) {
    if (!Uint8Array.prototype.slice) {
        Object.defineProperty(Uint8Array.prototype, "slice", {
            "value": Array.prototype.slice
        });
    }
    //-----------------------------------------------------
    //
    // Author: Daeren
    // Site: 666.io
    //
    //-----------------------------------------------------

    "use strict";

    //-----------------------------------------------------

    var bPack = function () {
        var holyBuffer = typeof Buffer !== "undefined" ? Buffer : function () {
            var MAX_ARGUMENTS_LENGTH = 0x1000;
            var K_MAX_LENGTH = 0x7fffffff;

            //---------------------]>

            return function () {
                var Buffer = function Buffer() {};

                //--------]>

                Buffer.allocUnsafe = allocUnsafe;
                Buffer.allocUnsafeSlow = allocUnsafe;
                Buffer.byteLength = byteLength;

                Buffer.prototype = Object.create(null);
                Buffer.prototype.write = write;
                Buffer.prototype.toString = toString;

                //--------]>

                return Buffer;

                //--------]>

                function allocUnsafe(length) {
                    if (length > K_MAX_LENGTH) {
                        throw new RangeError("Invalid typed array length");
                    }

                    var buf = new Uint8Array(length);

                    // buf.__proto__ = Buffer.prototype;
                    buf.write = Buffer.prototype.write;
                    buf.toString = Buffer.prototype.toString;

                    return buf;
                }

                function byteLength(string) {
                    return utf8ToBytes(string).length;
                }

                //----)>

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

                    return end === 0 ? "" : utf8Slice(this, start, end);
                }
            }();

            //---------------------]>

            function utf8ToBytes(string, units) {
                units = units || Infinity;

                var length = string.length;

                var codePoint = void 0;
                var leadSurrogate = null;
                var bytes = new Array();

                for (var i = 0; i < length; ++i) {
                    codePoint = string.charCodeAt(i);

                    // is surrogate component
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
                            }

                            // valid lead
                            leadSurrogate = codePoint;

                            continue;
                        }

                        // 2 leads in a row
                        if (codePoint < 0xDC00) {
                            if ((units -= 3) > -1) {
                                bytes.push(0xEF, 0xBF, 0xBD);
                            }

                            leadSurrogate = codePoint;

                            continue;
                        }

                        // valid surrogate pair
                        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                    } else if (leadSurrogate) {
                        // valid bmp char, but last char was a lead
                        if ((units -= 3) > -1) {
                            bytes.push(0xEF, 0xBF, 0xBD);
                        }
                    }

                    leadSurrogate = null;

                    // encode utf8
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
                        throw new Error("Invalid code point");
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
            }

            //--------)>

            function swap(b, n, m) {
                var i = b[n];

                b[n] = b[m];
                b[m] = i;
            }

            function decodeCodePointsArray(codePoints) {
                var len = codePoints.length;

                if (len <= MAX_ARGUMENTS_LENGTH) {
                    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
                }

                // Decode in chunks to avoid "call stack size exceeded".
                var res = "";
                var i = 0;

                while (i < len) {
                    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                }

                return res;
            }
        }();

        //-------------------------]>

        var isBigEndian = function () {
            var a = new Uint32Array([0x12345678]);
            var b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);

            return b[0] === 0x12;
        }();

        //-------------------------]>

        create.isBE = isBigEndian;
        create.isLE = !isBigEndian;

        return create;

        //-------------------------]>

        function create(schema, dataHolderAsArray, holderRecreated) {
            var TYPE_BIN = 1;
            var TYPE_STR = 2;
            var TYPE_INT = 4;
            var TYPE_UINT = 8;
            var TYPE_FLOAT = 16;
            var TYPE_JSON = 32;

            //-----------------]>

            if (!schema) {
                schema = [];
            }

            //-----------------]>

            var isPrimitive = typeof schema === "string";
            var schLen = isPrimitive ? 1 : schema.length;

            var fields = new Array(schLen);
            var buffers = new Array(schLen);

            var zeroUI16 = new Uint8Array(2);

            var pktOffset = 0,
                pktDataHolderArr = new Array(),
                pktDataHolderObj = Object.create(null),
                pktMinSize = 0,
                pktDynamicSize = false,
                pktBufStrict = null,
                pktBufPack = null;

            //-----------------]>

            for (var e, i = 0; i < schLen; ++i) {
                e = isPrimitive ? ["", schema] : schema[i].split(":");

                //---------]>

                var name = e.shift();
                var subType = e.shift();

                var type = getTypeId(subType.replace(/[\d\[\]]/g, ""));
                var size = parseInt(subType.replace(/\D/g, ""), 10) || 0;

                var _buildTypedBuf = buildTypedBuf(type, size),
                    _buildTypedBuf2 = _slicedToArray(_buildTypedBuf, 3),
                    bytes = _buildTypedBuf2[0],
                    bufType = _buildTypedBuf2[1],
                    bufAType = _buildTypedBuf2[2];

                var bufBytes = type & (TYPE_BIN | TYPE_STR) ? null : new Uint8Array(bufType.buffer);
                var bufABytes = bufAType ? new Uint8Array(bufAType.buffer) : null;

                //---------]>

                fields[i] = [name, type, bytes, bufType, bufBytes, bufAType, bufABytes];

                pktMinSize += bytes;

                if (!pktDynamicSize && type & (TYPE_BIN | TYPE_STR)) {
                    pktDynamicSize = true;
                }
            }

            offset(0);

            //-----------------]>

            return {
                get offset() {
                    return pktOffset;
                },
                set offset(value) {
                    offset(value);
                },

                pack: pack,
                unpack: unpack
            };

            //-----------------]>

            function offset(value) {
                value = parseInt(value, 10) || 0;

                pktMinSize = pktMinSize - pktOffset + value;
                pktOffset = value;

                if (!pktDynamicSize) {
                    pktBufStrict = new Uint8Array(pktMinSize);
                }
            }

            //------)>

            function pack(data, target) {
                var isArray = Array.isArray(data);

                var tIdx = void 0,
                    fieldIdx = schLen,
                    pktSize = pktOffset;

                var field = void 0;
                var name = void 0,
                    type = void 0,
                    bytes = void 0,
                    bufType = void 0,
                    bufBytes = void 0,
                    bufAType = void 0,
                    bufABytes = void 0;

                var input = void 0;

                //--------]>

                target = target || pktBufStrict;

                //--------]>

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


                    input = isPrimitive ? data : data[isArray ? fieldIdx : name];

                    //------]>

                    if (type & (TYPE_BIN | TYPE_STR)) {
                        if (type & TYPE_JSON) {
                            input = JSON.stringify(input);
                        }

                        if (input) {
                            bytes += bufAType[0] = type & TYPE_BIN ? blitBuffer(input, bufType, bytes, input.byteLength) : bufType.write(input, bytes);

                            bufBytes = bufType;
                            bufType._blen = bytes;

                            //-----]>

                            if (isBigEndian) {
                                bufType[0] = bufABytes[1];
                                bufType[1] = bufABytes[0];
                            } else {
                                bufType[0] = bufABytes[0];
                                bufType[1] = bufABytes[1];
                            }
                        } else {
                            bufBytes = zeroUI16;
                        }
                    } else {
                        if (input === null || isNaN(input) || !isFinite(input) || typeof input === "undefined") {
                            bufType[0] = 0;
                        } else {
                            bufType[0] = input;

                            if (isBigEndian && bufType.byteLength > 1) {
                                bufBytes.reverse();
                            }
                        }
                    }

                    //------]>

                    if (pktBufStrict) {
                        tIdx = 0;

                        while (bytes--) {
                            target[pktSize++] = bufBytes[tIdx++];
                        }
                    } else {
                        buffers[fieldIdx] = bufBytes;
                        pktSize += bytes;
                    }
                }

                //--------]>

                if (!pktBufStrict) {
                    target = target || pktBufPack && pktBufPack.length === pktSize ? pktBufPack : pktBufPack = holyBuffer.allocUnsafe(pktSize);

                    fieldIdx = schLen;
                    tIdx = pktOffset;

                    //--------]>

                    while (fieldIdx--) {
                        for (var b = buffers[fieldIdx], _i = 0, l = b._blen || b.length; _i < l; ++_i) {
                            target[tIdx++] = b[_i];
                        }
                    }
                }

                //--------]>

                return target;
            }

            function unpack(bin, offset, length, cbEndInfo, target) {
                var asArray = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : dataHolderAsArray;
                var asCopy = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : !holderRecreated;

                if (!schLen) {
                    if (cbEndInfo) {
                        cbEndInfo(pktOffset);
                    }

                    return null;
                }

                if (!bin || (typeof bin === "undefined" ? "undefined" : _typeof(bin)) !== "object" || bin.byteLength < pktMinSize) {
                    return void 0;
                }

                if (!isPrimitive) {
                    target = target || (asCopy ? asArray ? new Array() : Object.create(null) : asArray ? pktDataHolderArr : pktDataHolderObj);
                }

                //--------]>

                var field = void 0,
                    fieldIdx = schLen,
                    name = void 0,
                    type = void 0,
                    bytes = void 0,
                    bufType = void 0,
                    bufBytes = void 0,
                    bufAType = void 0,
                    bufABytes = void 0;

                var curOffset = offset + pktOffset;

                var pktOffsetStart = curOffset;

                //--------]>

                while (fieldIdx--) {

                    //------]>

                    var _fields$fieldIdx = _slicedToArray(fields[fieldIdx], 7);

                    name = _fields$fieldIdx[0];
                    type = _fields$fieldIdx[1];
                    bytes = _fields$fieldIdx[2];
                    bufType = _fields$fieldIdx[3];
                    bufBytes = _fields$fieldIdx[4];
                    bufAType = _fields$fieldIdx[5];
                    bufABytes = _fields$fieldIdx[6];
                    for (var _i2 = 0; _i2 < bytes; ++_i2) {
                        if (curOffset >= length) {
                            return void 0;
                        }

                        if (bufAType) {
                            bufABytes[_i2] = bin[curOffset++];
                        } else {
                            bufBytes[_i2] = bin[curOffset++];
                        }
                    }

                    //------]>

                    if (type & (TYPE_BIN | TYPE_STR)) {
                        if (isBigEndian) {
                            bufABytes.reverse();
                        }

                        //--------]>

                        var byteLen = bufAType[0];

                        //--------]>

                        if (!byteLen || byteLen >= length) {
                            field = type & (TYPE_BIN | TYPE_JSON) ? null : "";
                        } else {
                            var needMem = Math.min(bufType.length - bytes, length, byteLen);
                            var buf = type & TYPE_BIN ? holyBuffer.allocUnsafe(needMem) : bufType;

                            //-------]>

                            for (var _i3 = 0; _i3 < needMem; ++_i3, ++curOffset) {
                                buf[_i3] = bin[curOffset];
                            }

                            //-------]>

                            field = type & TYPE_BIN ? buf : buf.toString("utf8", 0, needMem);

                            if (type & TYPE_JSON) {
                                try {
                                    field = JSON.parse(field);
                                } catch (e) {
                                    field = null;
                                }
                            }
                        }
                    } else {
                        if (isBigEndian && bufType.byteLength > 1) {
                            bufBytes.reverse();
                        }

                        field = bufType[0];
                    }

                    //------]>

                    if (isPrimitive) {
                        target = field;
                    } else {
                        if (asArray) {
                            name = fieldIdx;
                        }

                        target[name] = field;
                    }
                }

                if (cbEndInfo) {
                    cbEndInfo(pktOffset + curOffset - pktOffsetStart);
                }

                //--------]>

                return target;
            }

            //-----------------]>

            function buildTypedBuf(type, size) {
                if (type & TYPE_BIN) {
                    return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 1024) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
                }

                if (type & TYPE_JSON) {
                    return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 8192) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
                }

                if (type & TYPE_STR) {
                    return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 256) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
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

                            default:
                                throw new Error("Unknown size: " + size);
                        }

                    case TYPE_UINT:
                        switch (size) {
                            case 8:
                                return [Uint8Array.BYTES_PER_ELEMENT, new Uint8Array(1)];
                            case 16:
                                return [Uint16Array.BYTES_PER_ELEMENT, new Uint16Array(1)];
                            case 32:
                                return [Uint32Array.BYTES_PER_ELEMENT, new Uint32Array(1)];

                            default:
                                throw new Error("Unknown size: " + size);
                        }

                    case TYPE_FLOAT:
                        switch (size) {
                            case 32:
                                return [Float32Array.BYTES_PER_ELEMENT, new Float32Array(1)];
                            case 64:
                                return [Float64Array.BYTES_PER_ELEMENT, new Float64Array(1)];

                            default:
                                throw new Error("Unknown size: " + size);
                        }

                    default:
                        throw new Error("Unknown type: " + type);
                }
            }

            function getTypeId(type) {
                switch (type) {
                    case "b":
                    case "bin":
                        return TYPE_BIN;

                    case "j":
                    case "json":
                        return TYPE_STR | TYPE_JSON;

                    case "s":
                    case "str":
                        return TYPE_STR;

                    case "i":
                    case "int":
                        return TYPE_INT;

                    case "u":
                    case "uint":
                        return TYPE_UINT;

                    case "f":
                    case "float":
                        return TYPE_FLOAT;

                    default:
                        throw new Error("Unknown type: " + type);
                }
            }
        }

        function blitBuffer(src, dst, offset, length) {
            if (!length) {
                return 0;
            }

            //-------]>

            var dstLen = dst.length;
            var srcLen = src.length;

            var i = void 0,
                t = void 0;

            //-------]>

            for (i = 0; i < length; ++i) {
                t = i + offset;

                if (t >= dstLen || i >= srcLen) {
                    break;
                }

                dst[t] = src[i];
            }

            //-------]>

            return i;
        }
    }();

    //-----------------------------------------------------

    module.exports = bPack;

    return bPack;
}({});
//# sourceMappingURL=2pack.js.map
