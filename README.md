[![Codacy][cod_b]][cod_l]

```
npm -g install 2pack
git clone https://github.com/Daeren/2pack.git
```


* Binary (Little/Big - Endian)
* Relative and absolute zero-copy operations wherever possible
* Browser


#### Goals:
1. Low memory usage;
2. Maximum performance;
3. Flexibility;
4. Games.


```javascript
const packer = require("2pack");

const header = packer("int16");
const payload = packer(["name:str", "hp:int16"]/*, unpackNewHolder, unpackDataAsArray*/);

//------------------------------

payload.offset = header.maxSize;

//---------]>

const id = 69;
const data = {name: "D", hp: 13};

const buf = header.pack(id, payload.pack(data));

//---------]>

console.log(
    packer.isBE,
    packer.isLE
);

console.log(
    header.unpack(buf, 0, buf.length),
    payload.unpack(buf, 0, buf.length)
);

//------------------------------

/*
packer("int16"); // primitive | returns: value
pack(0);

packer(["int16"]); // array | returns: array | unpackDataAsArray = true
pack([0]);

packer(["name:str"]); // object | returns: object
pack(["D"]);
pack({name: "D"});

packer(["int16", "name:str"]); // error

//----)>

unpack(bin, offset, length, cbEndInfo(offset), target, asCopy, asArray);

@bin - Buffer / Uint8Array
*/
```


```javascript
> Node.js v8.9.4


2pack.pack: 2799.724ms
2pack.pack.static: 2251.945ms
2pack.unpack: 5212.609ms

msgpackLite.pack: 9648.407ms
msgpackLite.pack.static: 8721.737ms
msgpackLite.unpack: 12450.920ms

2pack.pack.without(str): 604.289ms
2pack.unpack.without(str): 1542.349ms

msgpackLite.pack.without(str): 5027.350ms
msgpackLite.unpack.without(str): 5191.954ms

```


##### Packet type

| Name                | Alias   | Note                                                             |
|---------------------|---------|------------------------------------------------------------------|
|                     | -       |                                                                  |
| bin<size (byte)>    | b       | default: max 1024 (0-65535); server: Buffer; client: Uint8Array; |
| str<size (byte)>    | s       | default: max 256 (0-65535)                                       |
| int<size (bit)>     | i       | size: 8, 16, 32                                                  |
| uint<size (bit)>    | u       | size: 8, 16, 32                                                  |
| float<size (bit)>   | f       | size: 32, 64                                                     |
| json<size (byte)>   | j       | default: max 8192 (0-65535)                                      |


## License

MIT

----------------------------------
[@ Daeren][1]
[@ Telegram][2]


[1]: http://666.io
[2]: https://telegram.me/io666

[cod_b]: https://img.shields.io/codacy/c9243ce691144a5380e6afa2361990ae.svg
[cod_l]: https://www.codacy.com/app/daeren/2pack/dashboard
