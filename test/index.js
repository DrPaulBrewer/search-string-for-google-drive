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

// example with all supported terms

const example = { 
    name: 'recipe.txt',
    fullText: 'add 3 cups apple sauce',
    mimeType: 'text/plain',
    trashed: false,
    starred: true,
    parents: 'root',
    owners: 'abc@gmail.com',
    readers: 'xyz@gmail.com',
    writers: 'qaz@gmail.com',
    sharedWithMe: true,
    properties: { x: 0, y:0, z:0, when: "now" },
    appProperties: { paidInBitcoin: false },
    visibility: 'limited'
};

    
const goodTerms = Object.keys(example);
const badTerms = typos.map((o)=>(Object.keys(o)[0]));

describe('search-string-for-google-drive: ', function(){

    it('should have function properties .supported, .isSupported, .extract exists ', function(){
	ssgd.should.have.properties(['supported','isSupported','extract']);
    });

    describe('ssgd.supported() should return an array including all supported search terms ',function(){
	it('should return an array', function(){
	    assert.ok(Array.isArray(ssgd.supported()));
	});
	goodTerms.sort().forEach((k)=>{
	    it(k, function(){
		assert.ok(ssgd.supported().includes(k));
	    });
	});
    });

    describe('ssgd.isSupported(k) should return true for supported terms and false for bad terms ', function(){
	goodTerms.forEach((k)=>{
	    it(k+' --> true ', function(){
		assert.ok(ssgd.isSupported(k));
	    });
	});
	badTerms.forEach((k)=>{
	    it(k+' --> false ', function(){
		assert.ok(!ssgd.isSupported(k));
	    });
	});
    });

    describe('ssgd.extract(obj) will create an object extracting supported terms only from obj ', function(){
	const mix = {
	    junk: 1,
	    trashed: 1
	};
	it('{junk:1, trashed: 1} --> (ssgd.extract) --> { trashed: 1 } ', function(){
	    ssgd.extract(mix).should.deepEqual({trashed: 1});
	});
    });

    describe('empty searches (which will match all files!) will throw an error unless allowed via 2nd parameter: ', function(){
	it('ssgd({}) --> Error ', function(){
	    function bad(){
		const q = ssgd({});
	    }
	    bad.should.throw();
	});
	it('ssgd({}, true) --> ""', function(){
	    ssgd({}, true).should.equal("");
	});
    });
    
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
    
    describe('typos or unknown keys: ', function(){
	describe(' throw an error ', function(){
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

    describe('example from README.md ', function(){
        const q = ssgd(example);
        it('q should have 21 and clauses', function(){
            q.split('and').length.should.equal(21);
        });
        describe('q should contain every single key clause', function(){
            Object.keys(example).forEach((k)=>{
                const singlet = {};
                singlet[k] = example[k];
                expected = ssgd(singlet);
                it(JSON.stringify(singlet)+' --> '+expected, function(){
                    assert.ok(q.includes(expected));
                });
            });
        });

	function testRemoveClauses(rm,how){ 	
	    describe('as we '+how+' the number of " and " clauses should decrease', function(){
		const example2 = Object.assign({}, example);
		const q = ssgd(example2);
		const keys = Object.keys(example2);
		let clauses = q.split(' and ').length;
		keys.forEach((k)=>{
		    function a(){ return ands; }
		    it(k, function(){
			rm(example2,k);
			const newq = ssgd(example2, true);
			const newClauses = (newq.length===0)? 0: newq.split('and').length;
			newClauses.should.be.below(clauses);
			clauses = newClauses;
		    });
		});
	    });;
	}

	testRemoveClauses((q,k)=>{ delete q[k]; },
			  'delete keys');
	
	testRemoveClauses((q,k)=>{q[k] = undefined; },
			  'set keys to undefined');

	
    });
});
