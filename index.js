/*
 * search-string-for-google-drive -- creates search string for Drive API v3 drive.files.list "q" parameter
 * This is a helper function for creating the "q" query string described in https://developers.google.com/drive/v3/web/search-parameters
 *
 *  Copyright 2017-2018 Paul Brewer, Economic and Financial Technology Consulting LLC <drpaulbrewer@eaftc.com>
 *  This file is open source software.  License: The MIT License
 *
 */

/* jshint browser:true,node:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true,strict:true */

"use strict";

const folderMimeType = 'application/vnd.google-apps.folder';

function escape(s){
    return "'"+String(s).replace(/'/g, "\\'")+"'";	
}


var q = {
    "string": function(op, combiner){
	return function(k,v){
	    if (Array.isArray(v)){
		return '( '+
		    v.map(function(eachv){
			return (k+' '+op+' '+escape(eachv));
		    }).join(' '+combiner+' ')+
		    ' )';
	    }
	    return k+' '+op+' '+escape(v);
	};
    },

    "boolean": function(){
	return function(k,v){
	    if ( (typeof(v)==='string') && (v.charAt(0)==="F" || v.charAt(0)==="f" || v==="0") )
		v = false;
	    return k+' = '+(!!v);
	};
    },

    "collection": function(combiner){
	return function(k,v){
	    if (Array.isArray(v)){
		return '( '+
		    v.map(function(eachv){
			return escape(eachv)+' in '+k;
		    }).join(' '+combiner+' ')+
		    ' )';
	    }
	    return escape(v)+' in '+k;
	};
    },
    
    "hash": function(){
	return function(k,v){
	    return Object.keys(v).map(
		function(hk){
		    return k+' has { key='+escape(hk)+' and value='+escape(v[hk])+' }';
		}).join(' and ');
	};
    },

    "isFolder": function(){
	return function(k,v){
	    if ( (typeof(v)==='string') && (v.charAt(0)==="F" || v.charAt(0)==="f" || v==="0") )
		v = false;
	    var sep = (v)? ' = ' : ' != ' ;
	    return 'mimeType'+sep+escape(folderMimeType);
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
    visibility: q.string('=','or'),
    isFolder: q.isFolder()
};


function ssgd(spec, matchAll){
    var queries = (
	Object.keys(spec)
	    .filter(function(k){ return (spec[k]!==undefined) && (spec[k]!==null); })
	    .map(function(k){ 
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
	    })
    );
    var q = queries.join(' and ');
    if ((q.length===0) && (matchAll))
	return q;
    if (q.length>0)
	return q;
    throw new Error("blank, match-all, query prohibited by configuration at search-string-for-google-drive");
}

ssgd.supported = function(){
    return Object.keys(handlers);
};

ssgd.isSupported = function(k){
    return (k in handlers) && (handlers.hasOwnProperty(k));
};

ssgd.extract = function(slop){
    var spec = {};
    Object.keys(handlers).forEach(function(k){
	if ((k in slop) && (slop.hasOwnProperty(k))){
	    spec[k] = slop[k];
	}
    });
    return spec;
};
    
module.exports = ssgd;
