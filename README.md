[![Codacy][cod_b]][cod_l]

```
npm -g install 2pack
git clone https://github.com/Daeren/2pack.git
```


* Binary (Little/Big - Endian)
* Relative and absolute zero-copy operations wherever possible


#### Goals:
1. Low memory usage;
2. Maximum performance;
3. Flexibility;
4. Games.


```javascript
const packer = require("2pack");

const header = packer("int16");
const payload = packer(["name:str", "hp:int16"]/*, unpackDataAsArray, unpackNewHolder*/);

const headerSize = 2;

//---------]>

payload.offset = headerSize;

//---------]>

const id = 69;
const data = {name: "D", hp: 13}; // or ["D", 13]

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
