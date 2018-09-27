# write2sheet

[![Build Status](https://travis-ci.org/averissimo/write2sheet.svg?branch=master)](https://travis-ci.org/averissimo/write2sheet)
[![Greenkeeper badge](https://badges.greenkeeper.io/averissimo/write2sheet.svg)](https://greenkeeper.io/)

> Simple Node.js library to write to Google Sheets

Super simple library that writes data into a Google Sheet

## Requirements

- Node.js *(v8 or up)*
- Get a OAuth2.0 authorization by following [this guide](https://developers.google.com/sheets/api/guides/authorizing) (see `Authorizing requests with OAuth 2.0`)
  - Write the `client_secret.json` to folder
- Run it *(the first time it runs it will ask for permissions)*

## Example

Simple example to write current date to a cell

```
const moment = require('moment');
const GoogleSheetWrite = require('.');

const sheet = new GoogleSheetWrite('<some spreadsheet id>');

// Update date
const mydate = moment().format('YYYY/MM/DD HH:mm:ss');
const range = 'Sheet!B4';

sheet.write([[mydate]], range);
```

Example to write current coin values to Range in sheet `Currencies` (using [averissimo/crypto-market-scrapper](https://github.com/averisimo/crypto-market-scrapper))


```
const scrapper = require('crypto-market-scrapper');
const GoogleSheetWrite = require('.');

const sheet = new GoogleSheetWrite('<some spreadsheet id>');

const currencies = scrapper.getCurrencies([{
  "description": "Garlicoin",
  "code": "GRLC",
  "url": "https://coinmarketcap.com/currencies/garlicoin/"
}, {
  "description": "Bitcoin   ",
  "code": "BTC",
  "url": "https://coinmarketcap.com/currencies/bitcoin/"
}]);

currencies.then(response => {
	const values = response.sort((a, b) => {
		return a.code.localeCompare(b.code);
	}).map(el => {
		return [el.description, el.code, el.usd];
	});
	// Write to sheet
	sheet.write(values, 'Currencies!B9:D');
});
```

## Donating

*Consider donating if this library has helped*

- ETH: 0xd6692892ab173fea765b09cb7adc105d6a5337d0
- LTC: LKmUFmAjUkmVLieJydrtiBeAAuUZi9A3CB
- Nano: xrb_1m9eh9ojnh4fp35p49pim1ohmwjzt74ctiucdnyydwf3whkm8ur66jroc6da
- GRLC: GW4EB6nLbx8B4TGD6nZLUXSWN92am2S5PN

## License

GNU General public license (v3), see `LICENSE` for more details
