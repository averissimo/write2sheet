const moment = require('moment');
const fs = require('fs');
const zlib = require('zlib');
const GoogleSheetWrite = require('.');

const sheet = new GoogleSheetWrite('1zCLdrovpsRAGGWYF4rHcBOD9Tl3_woc0BgDXjoCd9c0');
sheet.write([['Test successful! ' + moment().format()]], 'Sheet1!A1:A1')

console.log(sheet.promise)
