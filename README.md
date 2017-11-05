search-string-for-google-drive
----------
[![Build Status](https://travis-ci.org/DrPaulBrewer/search-string-for-google-drive.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/search-string-for-google-drive)
[![Coverage Status](https://coveralls.io/repos/github/DrPaulBrewer/search-string-for-google-drive/badge.svg?branch=master)](https://coveralls.io/github/DrPaulBrewer/search-string-for-google-drive?branch=master)

Constructs query search string needed by Google Drive[tm] API v3 [drive.files.list](https://developers.google.com/drive/v3/reference/files/list)

This is a helper function for creating the "q" query string documented in  https://developers.google.com/drive/v3/web/search-parameters

It does not call any API functions.  Tests check that it produces strings as described in the above document.

## Installation

`npm i search-string-for-google-drive -S`

## Dependencies

None.  Suitable for usage on nodejs or on the browser, via browserify/webpack/jspm/etc.

## Initialization

    const ssgd = require('search-string-for-google-drive');

## Usage

`{...}` is a placeholder for additional code 

    const q = ssgd({...your object defining a search...});
	gapi.client.drive.files.list({q, ...}).then({...}); // gapi on browser. 
	drive.files.list({q, ...}, function(e,result){...}); // googleapis on nodejs

## Supported clauses

The time/date clauses are not currently supported.  

Here is an example showing every clause.  To understand what they do, refer to the Google Documentation linked above.

```
{ 
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
}
```

Values are generally converted to string or boolean as appropriate and quoted and escaped as described in the Google Drive API documentation.

If you use properties and appProperties it will require all keys and values to be as specified, and will yield the relevant " and " clauses.

This module will also accept arrays for these elements:

Creates an Or-clause for the mapped clauses:  name, mimeType, parents, owners, readers, writers

Creates an And-Clause for the mapped clauses: fullText

## Practical Examples

```
q = ssgd({ name: 'Hello.txt' });  // searches for files named "Hello.txt"
q = ssgd({ name: 'Hello.txt', parents: 'root' }); // searches for file named "Hello.txt" in the root directory
q = ssgd({ name: 'savedSession', trashed: true, mimeType: ['application/json','text/plain'] }); // searches for file named 'savedSession' in the Trash and is a json or a text file
q = ssgd({ appProperties: {'cheated': 'true', why: 'neverDies' } }); // seaches for any file where the custom app property 'cheated' is set to the string 'true' and custom app property 'why' is set to 'neverDies'
q = ssgd({ mimeType: 'application/zip', name: ['data.zip','rawdata.zip'], parents: [folderA.id, folderB.id] }); // searches for a zip file named data.zip or rawdata.zip in either of two folders 
```

## Single/Plural corrections

This module will correct some incorrect keys `names` to `name` and `parent` to `parents`, but you should not be relying on that.

### Copyright

Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC

### License

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### No relationship to Google, Inc.

This software is 3rd party software. This software is not a product of Google, Inc.

Google Drive[tm] is a trademark of Google, Inc.


