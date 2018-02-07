//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const packer = require("./../index");
const msgpackLite = require("msgpack-lite");

//-----------------------------------------------------

void function() {
    const data = {
        lvl:    -300.2,
        hp:     100.44,
        gm:     Infinity,
        x:      300.9,
        y:      -300.52
    };
    const schema = [
        "lvl:int8",
        "hp:uint16",
        "gm:uint8",
        "x:float32",
        "y:float64"
    ];

    const pktHero = packer(schema, false);

    let l, t, buf;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("2pack.pack.without(str)");

    while(l--) {
        t = pktHero.pack(data);
    }

    console.timeEnd("2pack.pack.without(str)");

    //-----------------]>

    buf = t;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("2pack.unpack.without(str)");

    while(l--) {
        t = pktHero.unpack(buf, 0, buf.length);
    }

    console.timeEnd("2pack.unpack.without(str)");
}();

void function() {
    const data = {
        lvl:    -300.2,
        hp:     100.44,
        gm:     Infinity,
        x:      300.9,
        y:      -300.52
    };

    let l, t, buf;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("msgpackLite.pack.without(str)");

    while(l--) {
        t = msgpackLite.encode(data);
    }

    console.timeEnd("msgpackLite.pack.without(str)");

    //-----------------]>

    buf = t;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("msgpackLite.unpack.without(str)");

    while(l--) {
        t = msgpackLite.decode(buf);
    }

    console.timeEnd("msgpackLite.unpack.without(str)");
}();

//-----------------------------------------------------

void function() {
    const data = {
        data:   JSON.stringify({x:1, b: "b".repeat(1)}),
        name:   "DT | (っ◕‿◕)っ ♥ | Привет",
        status: "X  | (っ◕‿◕)っ ♥  Да",
        e8:     "",
        e:      "",
        lvl:    -300.2,
        hp:     100.44,
        gm:     Infinity,
        x:      300.9,
        y:      -300.52
    };
    const schema = [
        "data:str",
        "name:str",
        "status:str",
        "e8:str",
        "e:str",
        "e1:str",
        "e2:int8",
        "e3:str",
        "lvl:int8",
        "hp:uint16",
        "gm:uint8",
        "x:float32",
        "y:float64"
    ];

    const pktHero = packer(schema, false);

    let l, t, buf;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("2pack.pack");

    while(l--) {
        data.name = (l % 2 === 0 ? "0" : "") + l.toString();
        t = pktHero.pack(data);
    }

    console.timeEnd("2pack.pack");


    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("2pack.pack.static");

    while(l--) {
        t = pktHero.pack(data);
    }

    console.timeEnd("2pack.pack.static");

    //-----------------]>

    buf = t;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("2pack.unpack");

    while(l--) {
        t = pktHero.unpack(buf, 0, buf.length);
    }

    console.timeEnd("2pack.unpack");
}();

void function() {
    const data = {
        data:   JSON.stringify({x:1, b: "b".repeat(1)}),
        name:   "DT | (っ◕‿◕)っ ♥ | Привет",
        status: "X  | (っ◕‿◕)っ ♥  Да",
        e8:     "",
        e:      "",
        lvl:    -300.2,
        hp:     100.44,
        gm:     Infinity,
        x:      300.9,
        y:      -300.52
    };

    let l, t, buf;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("msgpackLite.pack");

    while(l--) {
        data.name = (l % 2 === 0 ? "0" : "") + l.toString();
        t = msgpackLite.encode(data);
    }

    console.timeEnd("msgpackLite.pack");

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("msgpackLite.pack.static");

    while(l--) {
        t = msgpackLite.encode(data);
    }

    console.timeEnd("msgpackLite.pack.static");

    //-----------------]>

    buf = t;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("msgpackLite.unpack");

    while(l--) {
        t = msgpackLite.decode(buf);
    }

    console.timeEnd("msgpackLite.unpack");
}();