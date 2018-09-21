const moment = require('moment');
const fs = require('fs');
const zlib = require('zlib');
const GoogleSheetWrite = require('.');

const sheet = new GoogleSheetWrite('1zCLdrovpsRAGGWYF4rHcBOD9Tl3_woc0BgDXjoCd9c0');
sheet.write([['Test successful! ' + moment().format()]], 'Sheet1!A1:A1')
.then((res) => console.log(res))
.catch((err) => console.log(err))

sheet.write([['Test successful! ' + moment().format()]], 'Sheet21!A1:A1')
.then((res) => console.log(res))
.catch((err) => console.log('Error as Sheet21 does not exist. See the err for more information as this is a manual error message'))
