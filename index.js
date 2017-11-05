/*
 * search-string-for-google-drive -- creates search string for Drive API v3 drive.files.list "q" parameter
 * This is a helper function for creating the "q" query string described in https://developers.google.com/drive/v3/web/search-parameters
 *
 *  Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC <drpaulbrewer@eaftc.com>
 *  This file is open source software.  License: The MIT License
 *
 */

/* jshint browser:true,node:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true,strict:true */

function escape(s){
    return "'"+String(s).replace(/'/g, "\\'")+"'";	
}

var q = {
    "string": function(op, combiner){
	return function(k,v){
	    if (Array.isArray(v)){
		return '( '+v.map((eachv)=>(k+' '+op+' '+escape(eachv))).join(' '+combiner+' ')+' )';
	    }
	    return k+' '+op+' '+escape(v);
	};
    },

    "boolean": function(){
	return function(k,v){
	    if ( (typeof(v)==='string') && (v.startsWith("F") || v.startsWith("f") || (v==="0")) )
		v = false;
	    return k+' = '+(!!v);
	};
    },

    "collection": function(combiner){
	return function(k,v){
	    if (Array.isArray(v)){
		return '( '+v.map((eachv)=>(escape(eachv)+' in '+k)).join(' '+combiner+' ')+' )';
	    }
	    return escape(v)+' in '+k;
	};
    },
    
    "hash": function(){
	return function(k,v){
	    return Object.keys(v).map((hk)=>(k+' has { key='+escape(hk)+' and value='+escape(v[hk])+' }')).join(' and ');
	};
    }
};

var handlers = {
    name: q.string('=','or'),
    fullText: q.string('contains','and'),
    mimeType: q.string('=','or'),
    trashed: q.boolean(),
    starred: q.boolean(),
    parents: q.collection('or'),
    owners: q.collection('or'),
    writers: q.collection('or'),
    readers: q.collection('or'),
    sharedWithMe: q.boolean(),
    properties: q.hash('and'),
    appProperties: q.hash('and'),
    visibility: q.string('=','or')
};


module.exports = function(spec){
    var queries = Object.keys(spec).map((k)=>{
	if (typeof(handlers[k])==='function')
	    return (handlers[k])(k,spec[k]);
	// fix singular<-->plural
	var lastChar = k.charAt(k.length-1);
	var kPlural = (lastChar!=='s')? k+'s' : false;
	var kSingular = (lastChar==='s')? k.substr(0,k.length-1): false;
	if (kPlural && (typeof(handlers[kPlural])==='function'))
	    return (handlers[kPlural])(kPlural,spec[k]);
	if (kSingular && (typeof(handlers[kSingular]==='function')))
	    return (handlers[kSingular])(kSingular,spec[k]);
	throw new Error("search key "+escape(k)+" unsupported");
    });
    return queries.join(' and ');
};
