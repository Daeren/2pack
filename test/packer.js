//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

/*jshint expr: true*/
/*global describe, it*/

//-----------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

const packer = require("./../index");

//-----------------------------------------------------

const gSchemaWithStrings = [
    "bin:bin",
    "json:json",
    "data:str",
    "name:str1024",
    "status:str",
    "e8:str512",
    "e:str32",
    "e1:str",
    "e2:int8",
    "e3:str",
    "lvl:int8",
    "hp:uint16",
    "gm:uint8",
    "x:float32",
    "y:float64"
];

const gSchemaWithoutStrings = [
    "lvl:int8",
    "hp:uint16",
    "gm:uint8",
    "x:float32",
    "y:float64"
];

//-----------------------------------------------------

const gDataWithStrings = {
    bin:    Buffer.from("test"),
    json:   {x:1, b: "b".repeat(1)},
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

const gDataWithoutStrings = {
    lvl:    -300.2,
    hp:     100.44,
    gm:     Infinity,
    x:      300.9,
    y:      -300.52
};

//------)>

const gExpDataWithStrings = {
    bin:    Buffer.from("test"),
    json:   {x:1, b: "b".repeat(1)},
    data:   JSON.stringify({x:1, b: "b".repeat(1)}),
    name:   "DT | (っ◕‿◕)っ ♥ | Привет",
    status: "X  | (っ◕‿◕)っ ♥  Да",
    e8:     "",
    e3:     "",
    e2:     0,
    e1:     "",
    e:      "",
    lvl:    -44,
    hp:     100,
    gm:     0,
    x:      300.8999938964844,
    y:      -300.52
};

const gExpDataWithStringsAsAray = gSchemaWithStrings.map((name) => gExpDataWithStrings[name.split(":")[0]]);


const gExpDataWithoutStrings = {
    lvl:    -44,
    hp:     100,
    gm:     0,
    x:      300.8999938964844,
    y:      -300.52
};

//------)>

const gJsonExpDataWithStrings = JSON.stringify(gExpDataWithStrings);
const gJsongExpDataWithoutStrings = JSON.stringify(gExpDataWithoutStrings);

const gMid = 136;

//------)>

let srzDataWithStrings;
let srzDataWithoutStrings;

let packDataWithStrings;
let packDataWithoutStrings;

let unpackDataWithStrings;
let unpackDataWithoutStrings;

//-----------------------------------------------------

function testUnpackData(d1, d2) {
    expect(d1 != null).to.equal(true);
    expect(d2 != null).to.equal(true);

    for(let k in d1) {
        ch(d2[k], d1[k]);
    }

    function ch(t1, t2) {
        // console.log("------------\\");
        // console.log(t1);
        // console.log("---||");
        // console.log(t2);
        // console.log("------------/");

        if(typeof(t1) === "number") {
            expect(t2).to.be.closeTo(t1, 0.001);
        } else {
            expect(t2).to.deep.equal(t1);
        }
    }
}

//-----------------------------------------------------

describe("Packer", function() {

    this.timeout(1000 * 10);

    //-----------------]>

    it("Base", function() {
        expect(packer.isBE).to.be.a("boolean");
        expect(packer.isLE).to.be.a("boolean");
        expect(packer).to.be.a("function");
    });

    //-----------------]>

    it("create", function() {
        srzDataWithStrings = packer(gSchemaWithStrings);
        srzDataWithoutStrings = packer(gSchemaWithoutStrings);
    });

    it("minSize and maxSize", function() {
        expect(packer("int16").minSize).to.be.a("number").and.equal(2);
        expect(packer("int32").minSize).to.be.a("number").and.equal(4);

        expect(packer("int16").maxSize).to.be.a("number").and.equal(2);
        expect(packer("int32").maxSize).to.be.a("number").and.equal(4);

        expect(packer(["int32", "bin8"]).minSize).to.be.a("number").and.equal(4 + (2 + 0));
        expect(packer(["int32", "bin8"]).maxSize).to.be.a("number").and.equal(4 + (2 + 8));

        expect(packer(["int32", "str8"]).minSize).to.be.a("number").and.equal(4 + (2 + 0));
        expect(packer(["int32", "str8"]).maxSize).to.be.a("number").and.equal(4 + (2 + 8));

        expect(packer(["int32", "json8"]).minSize).to.be.a("number").and.equal(4 + (2 + 0));
        expect(packer(["int32", "json8"]).maxSize).to.be.a("number").and.equal(4 + (2 + 8));
    });


    it("pack", function() {
        srzDataWithStrings = packer(gSchemaWithStrings);
        srzDataWithoutStrings = packer(gSchemaWithoutStrings);

        packDataWithStrings = srzDataWithStrings.pack(gDataWithStrings);
        packDataWithoutStrings = srzDataWithoutStrings.pack(gDataWithoutStrings);
    });

    it("unpack", function() {
        srzDataWithStrings = packer(gSchemaWithStrings);
        srzDataWithoutStrings = packer(gSchemaWithoutStrings);

        packDataWithStrings = srzDataWithStrings.pack(gDataWithStrings);
        packDataWithoutStrings = srzDataWithoutStrings.pack(gDataWithoutStrings);

        unpackDataWithStrings = srzDataWithStrings.unpack(packDataWithStrings, 0, packDataWithStrings.length, null, null, false, true);
        unpackDataWithoutStrings = srzDataWithoutStrings.unpack(packDataWithoutStrings, 0, packDataWithoutStrings.length);

        testUnpackData(unpackDataWithStrings, gExpDataWithStringsAsAray);
        testUnpackData(unpackDataWithoutStrings, gExpDataWithoutStrings);
    });

    it("unpack | Overflow", function() {
        const schemaShort = packer([
            "msg:str4",
            "num:int8"
        ]);

        const schemaLong = packer([
            "msg:str10",
            "num:int8"
        ]);

        const dataLong = {
            "msg": "1234567890",
            "num": 13
        };

        const dataShort = {
            "msg": "1234",
            "num": 13
        };

        const packetShort = schemaShort.pack(dataLong);
        const unpackDataShort = schemaShort.unpack(packetShort, 0, packetShort.length);

        const packetLong = schemaLong.pack(dataLong);
        const unpackDataLong = schemaShort.unpack(packetLong, 0, packetLong.length);


        testUnpackData(unpackDataShort, dataShort);
        expect(unpackDataLong).to.equal(void(0));
    });


    it("getId | WithStrings", function() {
        const pA = packer("int16");

        const p = packer(gSchemaWithStrings);
        p.offset = pA.maxSize;

        const b = pA.pack(gMid, p.pack(gDataWithStrings));

        expect(pA.unpack(b, 0, b.length)).to.be.a("number").and.equal(gMid);
    });

    it("getId | WithoutStrings", function() {
        const pA = packer("int16");

        const p = packer(gSchemaWithoutStrings);
        p.offset = pA.maxSize;

        const b = pA.pack(gMid, p.pack(gDataWithoutStrings));

        expect(pA.unpack(b, 0, b.length)).to.be.a("number").and.equal(gMid);
    });

    it("getId | wide", function() {
        const pA = packer("int16");

        const id = 13666;
        const data = 888;

        const p = packer("uint16", false, true);
        p.offset = pA.maxSize;

        const b = pA.pack(id, p.pack(data));
        const u = p.unpack(b, 0, b.length);
        const i = pA.unpack(b, 0, b.length);

        expect(i).to.be.a("number").and.equal(id);
        expect(u).to.be.a("number").and.equal(data);
    });


    it("primitive", function() {
        const pA = packer("int16");

        const id = 13;
        const data = "test";

        const p = packer("str");
        p.offset = pA.maxSize;

        const b = pA.pack(id, p.pack(data));
        const u = p.unpack(b, 0, b.length);
        const i = pA.unpack(b, 0, b.length);

        expect(i).to.be.a("number").and.equal(id);
        expect(u).to.be.a("string").and.equal(data);
    });

    it("primitive:size", function() {
        const pA = packer("int16");

        const id = 13;
        const data = "test";

        const p = packer("str32");
        p.offset = pA.maxSize;

        const b = pA.pack(id, p.pack(data));
        const u = p.unpack(b, 0, b.length);
        const i = pA.unpack(b, 0, b.length);

        expect(i).to.be.a("number").and.equal(id);
        expect(u).to.be.a("string").and.equal(data);
    });

    it("empty:schema", function() {
        const pA = packer("int16");

        const id = 13;

        const p = packer();
        p.offset = pA.maxSize;

        const b = pA.pack(id, p.pack());
        const u = p.unpack(b, 0, b.length);
        const i = pA.unpack(b, 0, b.length);

        expect(i).to.be.a("number").and.equal(id);
        expect(u).to.equal(null);
    });

    it("empty:schema.str", function() {
        const pA = packer("int16");

        const id = 13;

        const p = packer(["str", "int32"]);
        p.offset = pA.maxSize;

        const b = pA.pack(id, p.pack());
        const u = p.unpack(b, 0, b.length);
        const i = pA.unpack(b, 0, b.length);

        expect(i).to.be.a("number").and.equal(id);
        expect(u && u[0]).to.equal("");
        expect(u && u[1]).to.equal(0);
    });

    it("schema.str.dBuffer", function() {
        const pA = packer("int16"); // 2
        const pB = packer(["int16", "int16", "str10"]); // 2 + 2 + (2 + 10)

        pB.offset = pA.maxSize; // 2 + (2 + 2 + (2 + 10)) = 18

        const b = pA.pack(13, pB.pack([6, 9, "1234567"])); // 15

        const i = pA.unpack(b, 0, b.length);
        const u = pB.unpack(b, 0, b.length);

        expect(pA.minSize).to.equal(2);
        expect(pA.maxSize).to.equal(2);

        expect(pB.minSize).to.equal(8);
        expect(pB.maxSize).to.equal(18);

        expect(i).to.equal(13);
        expect(u && u[0]).to.equal(6);
        expect(u && u[1]).to.equal(9);
        expect(u && u[2]).to.equal("1234567");
    });

    it("src.Uint8Array", function() {
        const pA = packer("str8"); // 2 + 8 = 10
        const data = "☃";

        const b = pA.pack(data); // 2 + 3 = 5
        const i = pA.unpack(b, 0, b.length);
        const i2 = pA.unpack(new Uint8Array(b), 0, b.length);

        expect(b.length).to.equal(5);
        expect(data).to.equal(i);
        expect(data).to.equal(i2);
    });

    it("BigStr", function() {
        const pA = packer(["uint32", "str8"]); // 4 + (2 + 8) = 14

        const b = pA.pack([11, "12345678900000000"]);
        const i = pA.unpack(new Uint8Array(b), 0, b.length);

        expect(pA.minSize).to.equal(6);
        expect(pA.maxSize).to.equal(14);

        expect(i && i[0]).to.equal(11);
        expect(i && i[1]).to.equal("12345678");
    });

    it("BigBin", function() {
        const pA = packer(["uint32", "bin8"]); // 4 + (2 + 8) = 14

        const b = pA.pack([11, "12345678900000000"]);
        const i = pA.unpack(new Uint8Array(b), 0, b.length);

        expect(pA.minSize).to.equal(6);
        expect(pA.maxSize).to.equal(14);

        expect(i && i[0]).to.equal(11);
        expect(Buffer.from("12345678".split("")).compare(i && i[1])).to.equal(0);
    });

});
