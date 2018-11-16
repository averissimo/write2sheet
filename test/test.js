/* eslint indent: ["error", 2] */
const assert = require('assert');
const chai = require('chai');
const moment = require('moment');
const {describe, it} = require('mocha');
const {expect} = require('chai');
const GoogleSheetWrite = require('..');

chai.use(require('chai-as-promised'));

console.log('#################################################################################');
console.log('#                                                                               #');
console.log('# Notice::                                                                      #');
console.log('#                                                                               #');
console.log('# This tests will run in a public sheet. It should work with anyone,            #');
console.log('#  as long as they have an API token already in the folder (client_secret.json) #');
console.log('#                                                                               #');
console.log('#                                                                               #');
console.log('#################################################################################');

const sheet = new GoogleSheetWrite('1zCLdrovpsRAGGWYF4rHcBOD9Tl3_woc0BgDXjoCd9c0');
const testStr = 'Test successful! ' + moment().format();

describe('write/read', () => {
  it('should fail for an invalid sheet', async () => {
    await expect(sheet.write([['Test successful! ' + moment().format()]], 'Sheet21!A1:A1'))
      .to.be.rejectedWith(/^Unable to parse range: Sheet21!A1:A1$/);
  }).timeout(60000);

  it('should write and read the new string', async () => {
    const writeResult = await sheet.write([[testStr]], 'Sheet1!A1:A1');
    assert.strictEqual(writeResult, 'INFO:: Finished writing to: Sheet1!A1:A1');
    const readResult = await sheet.read('Sheet1!A1:A1');
    assert.ok(readResult !== undefined);
    assert.ok(readResult[0] !== undefined);
    assert.ok(readResult[0][0] !== undefined);
    assert.strictEqual(readResult[0][0], testStr);
  }).timeout(60000);
});
