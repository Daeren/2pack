//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const packer = require("./../index");

//-----------------------------------------------------

testPacker({
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
    },
    [
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
    ]);

console.log("------------------");

testPacker({
        lvl:    122,
        hp:     4566,
        x:      -300.52,
        y:      -300.52
    },
    [
        "lvl:uint8",
        "hp:uint16",
        "x:float64",
        "y:float64"
    ]);

console.log("------------------");

testPacker({
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
    },
    [
        "e2:int8",
        "lvl:int8",
        "hp:uint16",
        "gm:uint8",
        "x:float32",
        "y:float64"
    ]);

//-----------------------------------------------------

function testPacker(data, schema) {
    const objJsonHero = data;
    const strJsonHero = JSON.stringify(objJsonHero);
    const bufJsonHero = Buffer.from(JSON.stringify(objJsonHero));

    const pktHero = packer(schema, false);
    const packPktHero = pktHero.pack(objJsonHero);

    let l, t;

    const pktHeroLen = packPktHero.byteLength;

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("pktHero.pack(objJsonHero)");

    while(l--) {
        objJsonHero.name = (l % 2 === 0 ? "0" : "") + l.toString();
        t = pktHero.pack(objJsonHero);
    }

    console.timeEnd("pktHero.pack(objJsonHero)");


    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("JSON.stringify(objJsonHero)");

    while(l--) {
        objJsonHero.name = (l % 2 === 0 ? "0" : "") + l.toString();
        t = JSON.stringify(objJsonHero);
    }

    console.timeEnd("JSON.stringify(objJsonHero)");

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("pktHero.pack(objJsonHero) | static.length");

    while(l--) {
        t = pktHero.pack(objJsonHero);
    }

    console.timeEnd("pktHero.pack(objJsonHero) | static.length");


    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("JSON.stringify(objJsonHero) | static.length");

    while(l--) {
        t = JSON.stringify(objJsonHero);
    }

    console.timeEnd("JSON.stringify(objJsonHero) | static.length");

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("pktHero.unpack(packPktHero)");

    while(l--) {
        t = pktHero.unpack(packPktHero, 0, pktHeroLen);
    }

    console.timeEnd("pktHero.unpack(packPktHero)");

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("JSON.parse(strJsonHero)");

    while(l--) {
        t = JSON.parse(strJsonHero);
    }

    console.timeEnd("JSON.parse(strJsonHero)");

    //-----------------]>

    l = 1000 * 1000 * 1;

    console.time("JSON.parse(bufJsonHero)");

    while(l--) {
        t = JSON.parse(bufJsonHero);
    }

    console.timeEnd("JSON.parse(bufJsonHero)");
}
