const packer = (function(module) {
//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

if(!Uint8Array.prototype.slice) {
    Object.defineProperty(Uint8Array.prototype, "slice", {
        value(begin, end) {
            //If 'begin' is unspecified, Chrome assumes 0, so we do the same
            if(begin === void 0) {
                begin = 0;
            }

            //If 'end' is unspecified, the new ArrayBuffer contains all
            //bytes from 'begin' to the end of this ArrayBuffer.
            if(end === void 0) {
                end = this.byteLength;
            }

            //Chrome converts the values to integers via flooring
            begin = Math.floor(begin);
            end = Math.floor(end);

            //If either 'begin' or 'end' is negative, it refers to an
            //index from the end of the array, as opposed to from the beginning.
            if(begin < 0) {
                begin += this.byteLength;
            }

            if (end < 0) {
                end += this.byteLength;
            }

            //The range specified by the 'begin' and 'end' values is clamped to the
            //valid index range for the current array.
            begin = Math.min(Math.max(0, begin), this.byteLength);
            end = Math.min(Math.max(0, end), this.byteLength);

            //If the computed length of the new ArrayBuffer would be negative, it
            //is clamped to zero.
            if(end - begin <= 0) {
                return new ArrayBuffer(0);
            }

            let len = end - begin;

            const result = new ArrayBuffer(len);
            const resultBytes = new Uint8Array(result);
            const sourceBytes = new Uint8Array(this, begin, len);


            while(len--) {
                resultBytes[len] = sourceBytes[len];
            }

            // some problems with IE11
            //resultBytes.set(sourceBytes);

            return resultBytes;
        }
    });
}

//-----------------------------------------------------

const bPack = (function() {
    const XBuffer = (typeof(Buffer) !== "undefined" ? Buffer : (function() {
            const MAX_ARGUMENTS_LENGTH = 0x1000;
            const K_MAX_LENGTH = 0x7fffffff;

            //---------------------]>

            return (function() {
                const Buffer = function() {};

                //--------]>

                Buffer.allocUnsafe = allocUnsafe;
                Buffer.allocUnsafeSlow = allocUnsafe;

                //--------]>

                return Buffer;

                //--------]>

                function allocUnsafe(length) {
                    if(length > K_MAX_LENGTH) {
                        throw new RangeError("Invalid typed array length");
                    }

                    const buf = new Uint8Array(length);

                    buf.write = write;
                    buf.toString = toString;

                    return buf;
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

            function decodeCodePointsArray(codePoints) {
                const len = codePoints.length;

                if(len <= MAX_ARGUMENTS_LENGTH) {
                    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
                }

                // Decode in chunks to avoid "call stack size exceeded".
                let res = "";
                let i = 0;

                while(i < len) {
                    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                }

                return res;
            }
        })());

    const isBigEndian = (function() {
        const a = new Uint32Array([0x12345678]);
        const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);

        return b[0] === 0x12;
    })();

    //-------------------------]>

    create.isBE = isBigEndian;
    create.isLE = !isBigEndian;

    //-------------------------]>

    return create;

    //-------------------------]>

    function create(schema, holderRecreated = false, dataHolderAsArray = false) {
        const TYPE_BIN      = 1;
        const TYPE_STR      = 2;
        const TYPE_INT      = 4;
        const TYPE_UINT     = 8;
        const TYPE_FLOAT    = 16;
        const TYPE_JSON     = 32;

        //-----------------]>

        if(!schema || !Array.isArray(schema) && typeof(schema) !== "string") {
            throw new Error("Invalid schema");
        }

        //-----------------]>

        const schemaContNames = Array.isArray(schema) ? schema.some((e) => e.split(":").length >= 2) : false;
        const schemaDontContNames = Array.isArray(schema) ? schema.some((e) => e.split(":").length < 2) : true;

        //-----------------]>

        if(schemaContNames && schemaDontContNames) {
            throw new Error("A schema has mixed names/types");
        }

        if(schemaDontContNames) {
            dataHolderAsArray = true;
        }

        //-----------------]>

        const isPrimitive   = typeof(schema) === "string";
        const schLen        = isPrimitive ? 1 : schema.length;

        const fields        = new Array(schLen);
        const zeroUI16      = new Uint8Array(2);

        //---------)>

        let pktDataBuf      = null;
        let pktOffset       = 0;
        let pktMinSize      = 0;
        let pktMaxSize      = 0;

        let pktDataHolderArr= new Array();
        let pktDataHolderObj= Object.create(null);

        //-----------------]>

        for(let i = 0; i < schLen; ++i) {
            const [subType, name] = isPrimitive ? [schema, ""] : schema[i].split(":").reverse();

            const type = getTypeId(subType.replace(/[\d\[\]]/g, ""));
            const size = parseInt(subType.replace(/\D/g, ""), 10) || 0;

            const [
                bytes,   // BYTES_PER_ELEMENT
                bufType, // dataView
                bufAType // dataSizeView
            ] = buildTypedBuf(type, size);

            const bufBytes = ((type & TYPE_STR) || (type & TYPE_BIN)) ? null : new Uint8Array(bufType.buffer);
            const bufABytes = bufAType ? new Uint8Array(bufAType.buffer) : null;

            //---------]>

            fields[i] = [name, type, bytes, bufType, bufBytes, bufAType, bufABytes];

            pktMinSize += bytes;
            pktMaxSize += bufType.byteLength;
        }

        offset(0);

        //-----------------]>

        return {
            get minSize() { return pktMinSize; },
            get maxSize() { return pktMaxSize; },

            get offset() { return pktOffset; },
            set offset(value) { offset(value); },

            pack,
            unpack
        };

        //-----------------]>

        function offset(value) {
            value = parseInt(value, 10) || 0;

            pktMinSize = (pktMinSize - pktOffset) + value;
            pktMaxSize = (pktMaxSize - pktOffset) + value;
            pktOffset = value;

            pktDataBuf = XBuffer.allocUnsafeSlow(pktMaxSize);
        }

        //------)>

        function pack(data, target) {
            const isArray = Array.isArray(data);
            const outTg = !!target;

            let fieldIdx = schLen;
            let pktSize = pktOffset;

            let input = data;

            let field;
            let name, type, bytes, bufType, bufBytes, bufAType, bufABytes;

            //--------]>

            target = target || pktDataBuf;

            //--------]>

            while(fieldIdx--) {
                field = fields[fieldIdx];
                [name, type, bytes, bufType, bufBytes, bufAType, bufABytes] = field;

                //------]>

                if(!isPrimitive && data) {
                    input = data[isArray ? fieldIdx : name];
                }

                //------]>

                if((type & TYPE_STR) || (type & TYPE_BIN)) {
                    if(type & TYPE_JSON) {
                        input = JSON.stringify(input);
                    }

                    if(input) {
                        bytes += bufAType[0] = type & TYPE_BIN ? blitBuffer(input, target, pktSize + bytes, bufType.byteLength - bytes) : target.write(input, pktSize + bytes, bufType.byteLength - bytes);

                        if(isBigEndian) {
                            target[pktSize] = bufABytes[1];
                            target[pktSize + 1] = bufABytes[0];
                        }
                        else {
                            target[pktSize] = bufABytes[0];
                            target[pktSize + 1] = bufABytes[1];
                        }

                        pktSize += bytes;

                    }
                    else {
                        target[pktSize] = 0;
                        target[pktSize + 1] = 0;

                        pktSize += 2;
                    }
                }
                else {
                    if(input == null || typeof(input) !== "bigint" && (isNaN(input) || !isFinite(input))) {
                        bufType[0] = 0;
                    }
                    else {
                        bufType[0] = input;

                        if(isBigEndian && bufType.byteLength > 1) {
                            bufBytes.reverse();
                        }
                    }

                    let tIdx = 0;

                    while(tIdx < bytes) {
                        target[pktSize] = bufBytes[tIdx];

                        ++pktSize;
                        ++tIdx;
                    }
                }
            }

            //--------]>

            return !outTg && pktSize < pktMaxSize ? target.slice(0, pktSize) : target;
        }

        function unpack(bin, offset, length, cbEndInfo, target, asCopy = !holderRecreated, asArray = dataHolderAsArray) {
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
                target = target || (asCopy ? (asArray ? new Array() : Object.create(null)) : (asArray ? pktDataHolderArr : pktDataHolderObj));
            }

            //--------]>

            let fieldIdx = schLen;
            let curOffset = offset + pktOffset;

            const pktOffsetStart = curOffset;

            //--------]>

            while(fieldIdx--) {
                let field;
                let [name, type, bytes, bufType, bufBytes, bufAType, bufABytes] = fields[fieldIdx];

                //------]>

                for(let i = 0; i < bytes; ++i) {
                    if(curOffset >= length) {
                        return void(0);
                    }

                    if(bufAType) {
                        bufABytes[i] = bin[curOffset];
                    }
                    else {
                        bufBytes[i] = bin[curOffset];
                    }

                    ++curOffset;
                }

                //------]>

                if((type & TYPE_STR) || (type & TYPE_BIN)) {
                    if(isBigEndian) {
                        bufABytes.reverse();
                    }

                    //--------]>

                    const byteLen = bufAType[0];

                    //--------]>

                    if(!byteLen) {
                        field = (type & TYPE_BIN) || (type & TYPE_JSON) ? null : "";
                    }
                    else if(byteLen >= length || byteLen > bufType.byteLength) {
                        return void(0);
                    }
                    else {
                        if(type & TYPE_BIN) {
                            const buf = XBuffer.allocUnsafeSlow(byteLen);

                            for(let i = 0; i < byteLen; ++i, ++curOffset) {
                                buf[i] = bin[curOffset];
                            }

                            field = buf;
                        }
                        else {
                            if(bin instanceof(XBuffer)) {
                                field = bin.toString("utf8", curOffset, curOffset + byteLen);
                            }
                            else if(XBuffer.from) {
                                field = XBuffer.from(bin).toString("utf8", curOffset, curOffset + byteLen);
                            }
                            else {
                                field = bufType.toString.call(bin, "utf8", curOffset, curOffset + byteLen);
                            }

                            curOffset += byteLen;
                        }

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
                    if(asArray) {
                        name = fieldIdx;
                    }

                    target[name] = field;
                }
            }

            if(cbEndInfo) {
                cbEndInfo(pktOffset + curOffset - pktOffsetStart);
            }

            //--------]>

            return target;
        }

        //-----------------]>

        function buildTypedBuf(type, size) {
            if(type & TYPE_BIN) {
                return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 1024) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            if(type & TYPE_JSON) {
                return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 8192) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            if(type & TYPE_STR) {
                return [Uint16Array.BYTES_PER_ELEMENT, XBuffer.allocUnsafeSlow((size || 256) + Uint16Array.BYTES_PER_ELEMENT), new Uint16Array(1)];
            }

            switch(type) {
                case TYPE_INT:
                    switch(size) {
                        case 8: return [Int8Array.BYTES_PER_ELEMENT, new Int8Array(1)];
                        case 16: return [Int16Array.BYTES_PER_ELEMENT, new Int16Array(1)];
                        case 32: return [Int32Array.BYTES_PER_ELEMENT, new Int32Array(1)];
                        case 64: return [BigInt64Array.BYTES_PER_ELEMENT, new BigInt64Array(1)];

                        default:
                            throw new Error(`Unknown size: ${size}`);
                    }


                case TYPE_UINT:
                    switch(size) {
                        case 8: return [Uint8Array.BYTES_PER_ELEMENT, new Uint8Array(1)];
                        case 16: return [Uint16Array.BYTES_PER_ELEMENT, new Uint16Array(1)];
                        case 32: return [Uint32Array.BYTES_PER_ELEMENT, new Uint32Array(1)];
                        case 64: return [BigUint64Array.BYTES_PER_ELEMENT, new BigUint64Array(1)];

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

return module.exports; })({});