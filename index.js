﻿//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

const bPack = (function() {
    const holyBuffer = (typeof(Buffer) !== "undefined" ? Buffer : (function() {
            const MAX_ARGUMENTS_LENGTH = 0x1000;
            const K_MAX_LENGTH = 0x7fffffff;

            //---------------------]>

            return (function() {
                const Buffer = function() {};

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
                    if(length > K_MAX_LENGTH) {
                        throw new RangeError("Invalid typed array length");
                    }

                    const buf = new Uint8Array(length);

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

                    const remaining = this.length - offset;

                    if(!length || length > remaining) {
                        length = remaining;
                    }

                    return blitBuffer(utf8ToBytes(string, this.length - offset), this, offset, length);
                }

                function toString(encoding, start, end) {
                    start = start || 0;
                    end = end || this.length;

                    return end === 0 ? "" : utf8Slice(this, start, end);
                }
            })();

            //---------------------]>

            function utf8ToBytes(string, units) {
                units = units || Infinity;

                const length = string.length;

                let codePoint;
                let leadSurrogate = null;
                let bytes = new Array();

                for(let i = 0; i < length; ++i) {
                    codePoint = string.charCodeAt(i);

                    // is surrogate component
                    if(codePoint > 0xD7FF && codePoint < 0xE000) {
                        // last char was a lead
                        if(!leadSurrogate) {
                            // no lead yet
                            if(codePoint > 0xDBFF) {
                                // unexpected trail
                                if((units -= 3) > -1) {
                                    bytes.push(0xEF, 0xBF, 0xBD);
                                }

                                continue;
                            }
                            else if(i + 1 === length) {
                                // unpaired lead
                                if((units -= 3) > -1) {
                                    bytes.push(0xEF, 0xBF, 0xBD);
                                }

                                continue;
                            }

                            // valid lead
                            leadSurrogate = codePoint;

                            continue;
                        }

                        // 2 leads in a row
                        if(codePoint < 0xDC00) {
                            if((units -= 3) > -1) {
                                bytes.push(0xEF, 0xBF, 0xBD);
                            }

                            leadSurrogate = codePoint;

                            continue;
                        }

                        // valid surrogate pair
                        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                    }
                    else if(leadSurrogate) {
                        // valid bmp char, but last char was a lead
                        if((units -= 3) > -1) {
                            bytes.push(0xEF, 0xBF, 0xBD);
                        }
                    }

                    leadSurrogate = null;

                    // encode utf8
                    if(codePoint < 0x80) {
                        if((units -= 1) < 0) {
                            break;
                        }

                        bytes.push(codePoint);
                    }
                    else if(codePoint < 0x800) {
                        if((units -= 2) < 0) {
                            break;
                        }

                        bytes.push(
                            codePoint >> 0x6 | 0xC0,
                            codePoint & 0x3F | 0x80
                        );
                    }
                    else if(codePoint < 0x10000) {
                        if((units -= 3) < 0) {
                            break;
                        }

                        bytes.push(
                            codePoint >> 0xC | 0xE0,
                            codePoint >> 0x6 & 0x3F | 0x80,
                            codePoint & 0x3F | 0x80
                        );
                    }
                    else if(codePoint < 0x110000) {
                        if((units -= 4) < 0) {
                            break;
                        }

                        bytes.push(
                            codePoint >> 0x12 | 0xF0,
                            codePoint >> 0xC & 0x3F | 0x80,
                            codePoint >> 0x6 & 0x3F | 0x80,
                            codePoint & 0x3F | 0x80
                        );
                    }
                    else {
                        throw new Error("Invalid code point");
                    }
                }

                return bytes;
            }

            function utf8Slice(buf, start, end) {
                end = Math.min(buf.length, end);

                const res = new Array();
                let i = start;

                while(i < end) {
                    let firstByte = buf[i];
                    let codePoint = null;
                    let bytesPerSequence = (firstByte > 0xEF) ? 4
                        : (firstByte > 0xDF) ? 3
                            : (firstByte > 0xBF) ? 2
                                : 1;

                    if(i + bytesPerSequence <= end) {
                        let secondByte, thirdByte, fourthByte, tempCodePoint;

                        switch(bytesPerSequence) {
                            case 1:
                                if(firstByte < 0x80) {
                                    codePoint = firstByte;
                                }

                                break;

                            case 2:
                                secondByte = buf[i + 1];

                                if((secondByte & 0xC0) === 0x80) {
                                    tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);

                                    if(tempCodePoint > 0x7F) {
                                        codePoint = tempCodePoint;
                                    }
                                }

                                break;

                            case 3:
                                secondByte = buf[i + 1];
                                thirdByte = buf[i + 2];

                                if((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                                    tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);

                                    if(tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                                        codePoint = tempCodePoint;
                                    }
                                }

                                break;

                            case 4:
                                secondByte = buf[i + 1];
                                thirdByte = buf[i + 2];
                                fourthByte = buf[i + 3];

                                if((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                                    tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);

                                    if(tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                                        codePoint = tempCodePoint;
                                    }
                                }
                        }
                    }

                    if(codePoint === null) {
                        // we did not generate a valid codePoint so insert a
                        // replacement char (U+FFFD) and advance only 1 byte
                        codePoint = 0xFFFD;
                        bytesPerSequence = 1;
                    }
                    else if(codePoint > 0xFFFF) {
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
                const i = b[n];

                b[n] = b[m];
                b[m] = i;
            }

            function decodeCodePointsArray(codePoints) {
                const len = codePoints.length;

                if(len <= MAX_ARGUMENTS_LENGTH) {
                    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
                }

                // Decode in chunks to avoid "call stack size exceeded".
                let res = "";
                let i = 0;

                while(i < len) {
                    res += String.fromCharCode.apply(
                        String,
                        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                    );
                }

                return res;
            }
        })());

    //-------------------------]>

    const isBigEndian = (function() {
        const a = new Uint32Array([0x12345678]);
        const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);

        return b[0] === 0x12;
    })();

    //-------------------------]>

    create.isBE = isBigEndian;
    create.isLE = !isBigEndian;

    return create;

    //-------------------------]>

    function create(schema, dataHolderAsArray, holderRecreated) {
        const TYPE_BIN      = 1;
        const TYPE_STR      = 2;
        const TYPE_INT      = 4;
        const TYPE_UINT     = 8;
        const TYPE_FLOAT    = 16;
        const TYPE_JSON     = 32;

        //-----------------]>

        if(!schema) {
            schema = [];
        }

        //-----------------]>

        const isPrimitive   = typeof(schema) === "string";
        const schLen        = isPrimitive ? 1 : schema.length;

        const fields        = new Array(schLen);
        const buffers       = new Array(schLen);

        const zeroUI16      = new Uint8Array(2);

        let pktOffset       = 0,

            pktDataHolder   = dataHolderAsArray ? new Array() : Object.create(null),
            pktMinSize      = 0,
            pktDynamicSize  = false,

            pktBufStrict    = null,
            pktBufPack      = null;

        //-----------------]>

        for(let e, i = 0; i < schLen; ++i) {
            e = isPrimitive ? ["", schema] : schema[i].split(":");

            //---------]>

            const name = e.shift();
            const subType = e.shift();

            const type = getTypeId(subType.replace(/[\d\[\]]/g, ""));
            const size = parseInt(subType.replace(/\D/g, ""), 10) || 0;

            const [
                bytes,
                bufType,
                bufAType
            ] = buildTypedBuf(type, size);

            const bufBytes = (type & (TYPE_BIN | TYPE_STR)) ? null : new Uint8Array(bufType.buffer);
            const bufABytes = bufAType ? new Uint8Array(bufAType.buffer) : null;

            //---------]>

            fields[i] = [name, type, bytes, bufType, bufBytes, bufAType, bufABytes];

            pktMinSize += bytes;

            if(!pktDynamicSize && (type & (TYPE_BIN | TYPE_STR))) {
                pktDynamicSize = true;
            }
        }

        offset(0);

        //-----------------]>

        return {
            get offset() { return pktOffset; },
            set offset(value) { offset(value); },

            pack,
            unpack
        };

        //-----------------]>

        function offset(value) {
            value = parseInt(value, 10) || 0;

            pktMinSize = pktMinSize - pktOffset + value;
            pktOffset = value;

            if(!pktDynamicSize) {
                pktBufStrict = new Uint8Array(pktMinSize);
            }
        }

        //------)>

        function pack(data, target) {
            const isArray   = Array.isArray(data);

            let tIdx,
                fieldIdx    = schLen,
                pktSize     = pktOffset;

            let field;
            let name, type, bytes, bufType, bufBytes, bufAType, bufABytes;

            let input;

            //--------]>

            target = target || pktBufStrict;

            //--------]>

            while(fieldIdx--) {
                field = fields[fieldIdx];
                [name, type, bytes, bufType, bufBytes, bufAType, bufABytes] = field;

                input = isPrimitive ? data : data[isArray ? fieldIdx : name];

                //------]>

                if(type & (TYPE_BIN | TYPE_STR)) {
                    if(type & TYPE_JSON) {
                        input = JSON.stringify(input);
                    }

                    if(input) {
                        bytes += bufAType[0] = type & TYPE_BIN ? blitBuffer(input, bufType, bytes, input.byteLength) : bufType.write(input, bytes);

                        bufBytes = bufType;
                        bufType._blen = bytes;

                        //-----]>

                        if(isBigEndian) {
                            bufType[0] = bufABytes[1];
                            bufType[1] = bufABytes[0];
                        }
                        else {
                            bufType[0] = bufABytes[0];
                            bufType[1] = bufABytes[1];
                        }
                    }
                    else {
                        bufBytes = zeroUI16;
                    }
                }
                else {
                    if(input === null || isNaN(input) || !isFinite(input) || typeof(input) === "undefined") {
                        bufType[0] = 0;
                    }
                    else {
                        bufType[0] = input;

                        if(isBigEndian && bufType.byteLength > 1) {
                            bufBytes.reverse();
                        }
                    }
                }

                //------]>

                if(pktBufStrict) {
                    tIdx = 0;

                    while(bytes--) {
                        target[pktSize++] = bufBytes[tIdx++];
                    }
                }
                else {
                    buffers[fieldIdx] = bufBytes;
                    pktSize += bytes;
                }
            }

            //--------]>

            if(!pktBufStrict) {
                target = target || pktBufPack && pktBufPack.length === pktSize ? pktBufPack : (pktBufPack = holyBuffer.allocUnsafe(pktSize));

                fieldIdx = schLen;
                tIdx = pktOffset;

                //--------]>

                while(fieldIdx--) {
                    for(let b = buffers[fieldIdx], i = 0, l = (b._blen || b.length); i < l; ++i) {
                        target[tIdx++] = b[i];
                    }
                }
            }

            //--------]>

            return target;
        }

        function unpack(bin, offset, length, cbEndInfo, target) {
            if(!schLen) {
                if(cbEndInfo) {
                    cbEndInfo(pktOffset);
                }

                return null;
            }

            if(!bin || typeof(bin) !== "object" || bin.byteLength < pktMinSize) {
                return void(0);
            }

            if(!isPrimitive) {
                target = target || (holderRecreated ? (dataHolderAsArray ? new Array() : Object.create(null)) : pktDataHolder);
            }

            //--------]>

            let field,
                fieldIdx = schLen,

                name, type, bytes, bufType, bufBytes, bufAType, bufABytes;

            let curOffset           = offset + pktOffset;

            const pktOffsetStart    = curOffset;

            //--------]>

            while(fieldIdx--) {
                [name, type, bytes, bufType, bufBytes, bufAType, bufABytes] = fields[fieldIdx];

                //------]>

                for(let i = 0; i < bytes; ++i) {
                    if(curOffset >= length) {
                        return void(0);
                    }

                    if(bufAType) {
                        bufABytes[i] = bin[curOffset++];
                    }
                    else {
                        bufBytes[i] = bin[curOffset++];
                    }
                }

                //------]>

                if(type & (TYPE_BIN | TYPE_STR)) {
                    if(isBigEndian) {
                        bufABytes.reverse();
                    }

                    //--------]>

                    const byteLen = bufAType[0];

                    //--------]>

                    if(!byteLen || byteLen >= length) {
                        field = type & (TYPE_BIN | TYPE_JSON) ? null : "";
                    }
                    else {
                        const needMem = Math.min(bufType.length - bytes, length, byteLen);
                        const buf = type & TYPE_BIN ? holyBuffer.allocUnsafe(needMem) : bufType;

                        //-------]>

                        for(let i = 0; i < needMem; ++i, ++curOffset) {
                            buf[i] = bin[curOffset];
                        }

                        //-------]>

                        field = type & TYPE_BIN ? buf : buf.toString("utf8", 0, needMem);

                        if(type & TYPE_JSON) {
                            try {
                                field = JSON.parse(field);
                            }
                            catch(e) {
                                field = null;
                            }
                        }
                    }
                }
                else {
                    if(isBigEndian && bufType.byteLength > 1) {
                        bufBytes.reverse();
                    }

                    field = bufType[0];
                }

                //------]>

                if(isPrimitive) {
                    target = field;
                }
                else {
                    if(dataHolderAsArray) {
                        name = fieldIdx;
                    }

                    target[name] = field;
                }
            }

            if(cbEndInfo) {
                cbEndInfo(curOffset + curOffset - pktOffsetStart);
            }

            //--------]>

            return target;
        }

        //-----------------]>

        function buildTypedBuf(type, size) {
            if(type & TYPE_BIN) {
                return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 1024) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            if(type & TYPE_JSON) {
                return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 8192) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            if(type & TYPE_STR) {
                return [Uint16Array.BYTES_PER_ELEMENT, holyBuffer.allocUnsafeSlow((size || 256) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            switch(type) {
                case TYPE_INT:
                    switch(size) {
                        case 8: return [Int8Array.BYTES_PER_ELEMENT, new Int8Array(1)];
                        case 16: return [Int16Array.BYTES_PER_ELEMENT, new Int16Array(1)];
                        case 32: return [Int32Array.BYTES_PER_ELEMENT, new Int32Array(1)];

                        default:
                            throw new Error(`Unknown size: ${size}`);
                    }


                case TYPE_UINT:
                    switch(size) {
                        case 8: return [Uint8Array.BYTES_PER_ELEMENT, new Uint8Array(1)];
                        case 16: return [Uint16Array.BYTES_PER_ELEMENT, new Uint16Array(1)];
                        case 32: return [Uint32Array.BYTES_PER_ELEMENT, new Uint32Array(1)];

                        default:
                            throw new Error(`Unknown size: ${size}`);
                    }


                case TYPE_FLOAT:
                    switch(size) {
                        case 32: return [Float32Array.BYTES_PER_ELEMENT, new Float32Array(1)];
                        case 64: return [Float64Array.BYTES_PER_ELEMENT, new Float64Array(1)];

                        default:
                            throw new Error(`Unknown size: ${size}`);
                    }

                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        }

        function getTypeId(type) {
            switch(type) {
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
                    throw new Error(`Unknown type: ${type}`);
            }
        }
    }

    function blitBuffer(src, dst, offset, length) {
        if(!length) {
            return 0;
        }

        //-------]>

        const dstLen = dst.length;
        const srcLen = src.length;

        let i, t;

        //-------]>

        for(i = 0; i < length; ++i) {
            t = i + offset;

            if(t >= dstLen || i >= srcLen) {
                break;
            }

            dst[t] = src[i];
        }

        //-------]>

        return i;
    }
})();

//-----------------------------------------------------

module.exports = bPack;
