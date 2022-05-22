* Binary (Little/Big - Endian)
* Relative and absolute zero-copy operations wherever possible
* Browser


#### Goals:
1. Low memory usage;
2. Maximum performance.


```javascript
const packer = require('2pack');

const header = packer('int16');
const payload = packer(['name:str', 'hp:int16']);

//------------------------------

payload.offset = header.maxSize;

//---------]>

const id = 69;
const data = { name: 'D', hp: 13 };

const buf = header.pack(id, payload.pack(data));
const size = buf.length;

//---------]>

console.log(packer.isBE, packer.isLE);

console.log(
    header.unpack(buf, 0, size),
    payload.unpack(buf, 0, size)
);

//------------------------------

/*
packer('int16'); // primitive | returns: value
pack(0);

packer(['int16']); // array | returns: array | unpackDataAsArray = true
pack([0]);

packer(['name:str']); // object | returns: object
pack(['D']);
pack({name: 'D'});

packer(['int16', 'name:str']); // error

//----)>

unpack(bin, offset, length, cbEndInfo(offset), target, asCopy, asArray);

@bin - Buffer / Uint8Array
*/
```


##### Packet type

| Name                | Alias   | Note                                                             |
|---------------------|---------|------------------------------------------------------------------|
|                     | -       |                                                                  |
| bin<size (byte)>    | b       | default: max 1024 (0-65535); server: Buffer; client: Uint8Array; |
| str<size (byte)>    | s       | default: max 256 (0-65535)                                       |
| int<size (bit)>     | i       | size: 8, 16, 32, 64 (BigInt64Array)                              |
| uint<size (bit)>    | u       | size: 8, 16, 32, 64 (BigUint64Array)                             |
| float<size (bit)>   | f       | size: 32, 64                                                     |
| json<size (byte)>   | j       | default: max 8192 (0-65535)                                      |


## License

MIT
