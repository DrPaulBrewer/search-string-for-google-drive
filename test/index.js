/* Copyright 2017 Paul Brewer Economic & Financial Technology Consulting LLC */
/* tests for seach-string-for-google-drive */
/* Open Source License: The MIT Public License */

const assert = require('assert');
const should = require('should');
const ssgd = require("../index.js");

const singles = [
    [ { name: 'Hello.txt'}, "name = 'Hello.txt'" ],
    [ { name: "Eat at Moe's"}, "name = 'Eat at Moe\\\'s'"],
    [ { names: "Foo.bar"}, "name = 'Foo.bar'"],
    [ { fullText: "complete"}, "fullText contains 'complete'"],
    [ { mimeType: "text/csv"}, "mimeType = 'text/csv'"],
    [ { mimeTypes: "text/csv"}, "mimeType = 'text/csv'"],
    [ { trashed: true }, "trashed = true"],
    [ { trashed: false }, "trashed = false"],
    [ { starred: true }, "starred = true"],
    [ { starred: false }, "starred = false"],
    [ { trashed: 1 }, "trashed = true"],
    [ { trashed: 0 }, "trashed = false"],
    [ { trashed: '1' }, "trashed = true"],
    [ { trashed: '0' }, "trashed = false"],
    [ { trashed: 'true' }, "trashed = true"],
    [ { trashed: 'false' }, "trashed = false"],
    [ { starred: 'T' }, "starred = true"],
    [ { starred: 'F' }, "starred = false"],
    [ { parent: '1E456787'}, "'1E456787' in parents"],
    [ { parents: '1E456787'}, "'1E456787' in parents"],
    [ { owner: 'abc@gmail'}, "'abc@gmail' in owners"],
    [ { owners: 'abc@gmail'}, "'abc@gmail' in owners"],
    [ { writer: 'xyz@gmail'}, "'xyz@gmail' in writers"],
    [ { writers: 'xyz@gmail'}, "'xyz@gmail' in writers"],
    [ { reader: 'qwerty@gmail'}, "'qwerty@gmail' in readers"],
    [ { readers: 'qwerty@gmail'}, "'qwerty@gmail' in readers"],
    [ { sharedWithMe: true }, "sharedWithMe = true"],
    [ { properties: { role: 'tick data' }}, "properties has { key='role' and value='tick data' }" ],
    [ { properties: { x: 35 }}, "properties has { key='x' and value='35' }" ],
    [ { appProperties: { paid: true } }, "appProperties has { key='paid' and value='true' }" ],
    [ { visibility: "limited" }, "visibility = 'limited'" ]
];

const orArrays = [
    { name: ["Hello.txt", "World.txt"] },
    { names: ["Hello.txt", "World.txt"] },
    { mimeType: ["text/plain","application/json"]},
    { mimeTypes: ["text/plain","application/json"]},
    { parents: ['dj348923948','akdjfka1929291']},
    { owners: ['bob@gmail','suzy@gmail'] },
    { writers: ['sam@gmail','tim@gmail'] },
    { readers: ['phil@gmail', 'tracy@gmail'] },
];

const andArrays = [
    { fullText: ["heteroskedasticity", "variance"] }
];

const hashes = [
    { properties: {a: 8, c:'always'} },
    { appProperties: { foo: 'bar', keep: false} }
];

const typos = [
    { fallText: 'war and peace' },
    { mimesType: 'bossy brunette'},
    { trashTalk: true },
    { stars: 'Arnold' },
    { sharredWihMe: true },
    { pooperties: { a: 45 }},
    { apProperties: { x: 'yz' } },
    { vizibility: "limited" }
];
    

describe('search-string-for-google-drive: ', function(){
    describe('single search terms:', function(){
	singles.forEach((spec)=>{
	    const item = spec[0];
	    const expected = spec[1];
	    it(JSON.stringify(item)+' --> '+JSON.stringify(expected), function(){
		const result = ssgd(item);
		result.should.equal(expected);
	    });
	});
    });
    
    describe('typos or unknown keys throw an error', function(){
	typos.forEach((spec)=>{
	    const item = spec;
	    it(JSON.stringify(item)+' --> Error', function(){
		function bad(){
		    const result = ssgd(item);
		}
		bad.should.throw();
	    });
	});
    });

    function checkArrays(source, combiner){
	source.forEach((spec)=>{
	    const k = Object.keys(spec)[0];
	    const vs = spec[k];
	    const A = {};
	    const B = {};
	    A[k] = vs[0];
	    B[k] = vs[1];
	    const correct = [
		'( '+ssgd(A)+combiner+ssgd(B)+' )',
		'( '+ssgd(B)+combiner+ssgd(A)+' )'
	    ];
	    it(JSON.stringify(spec)+"-->"+JSON.stringify(correct[0]), function(){
		assert.ok(correct.includes(ssgd(spec)));
	    });
	});
    }
    
    describe('arrays supplied to these elements yield "( or )" clauses', function(){
	checkArrays(orArrays, " or ");
    });
    
    describe('arrays supplied to these elements yield "( and )" clauses', function(){
	checkArrays(andArrays, " and ");
    });

    describe('pairs of single properties are concatenated with " and " ', function(){
	singles.forEach((spec1)=>{
	    const k1 = Object.keys(spec1[0])[0];
	    singles.forEach((spec2)=>{
		const k2 = Object.keys(spec2[0])[0];
		if (k1!==k2){
		    const spec = Object.assign({},spec1[0],spec2[0]);
		    const correct = [
			spec1[1]+" and "+spec2[1],
			spec2[1]+" and "+spec1[1]
		    ];
		    it(JSON.stringify(spec)+"-->"+JSON.stringify(correct[0]), function(){
			assert.ok(correct.includes(ssgd(spec)));
		    });
		}
	    });
	});
    });
});
