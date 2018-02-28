const path = require('path');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const GoogleAuth = require('google-auth-library');

/**
 * Class that contains methods to write to google sheetsKey
 *
 * Use the constructor with the key of a given document.
 *   https://docs.google.com/spreadsheets/d/<very long key to use in constuctor>/edit
 */
class GoogleSheetWrite {
	/**
	 * [constructor description]
	 * @param  {[type]} key String from  https://docs.google.com/spreadsheets/d/<very long key to use in constuctor>/edit
	 * @return {[type]}     new GoogleSheetWrite instance
	 */
	constructor(key) {
		this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
		this.TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
			process.env.USERPROFILE) + '/.credentials/';
		this.TOKEN_PATH = this.TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
		this.SECRET_PATH = path.join(__dirname, 'client_secret.json');

		if (!fs.existsSync(this.SECRET_PATH)) {
			throw new Error('client_secret.json does not exists, please create API token.');
		}
		this.sheetsKey = key;
	}

	/**
	 * Get authorization and call the method that updates the sheet.
	 *
	 * Note: it does not verify if data size is same or compatible as range.
	 * @param  {[type]} values Data to be written to range
	 * @param  {[type]} range  Range in sheet, ex: C1:D
	 */
	write(values, range) {
		// Load client secrets from a local file.
		fs.readFile('client_secret.json', (err, content) => {
			if (err) {
				console.log('Error loading client secret file: ' + err);
				return;
			}
			// Authorize a client with the loaded credentials, then call the
			// Google Sheets API.
			this.authorize(JSON.parse(content), auth => {
				return this.updateSheet(auth, values, range);
			});
		});
	}

	/**
	 * Updates the sheet with the new data
	 * @param  {[type]} auth   authorization
	 * @param  {[type]} values data to be written
	 * @param  {[type]} range  range where to write
	 */
	updateSheet(auth, values, range) {
		const sheets = google.sheets('v4');
		// Write to sheet
		const request = {
			auth,
			spreadsheetId: this.sheetsKey,
			valueInputOption: 'USER_ENTERED',
			resource: {
				range,
				values
			},
			range
		};
		sheets.spreadsheets.values.update(request, (err, response) => {
			if (err) {
				console.error(err);
			} else {
				console.log('INFO:: Finished writing to: ' + range + ' (response: ' + response + ')');
			}
		});
	}

	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 *
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	authorize(credentials, callback) {
		const clientSecret = credentials.installed.client_secret;
		const clientId = credentials.installed.client_id;
		const redirectUrl = credentials.installed.redirect_uris[0];
		const auth = new GoogleAuth();
		const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

		// Check if we have previously stored a token.
		fs.readFile(this.TOKEN_PATH, (err, token) => {
			if (err) {
				this.getNewToken(oauth2Client, callback);
			} else {
				oauth2Client.credentials = JSON.parse(token);
				callback(oauth2Client);
			}
		});
	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 *
	 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback to call with the authorized
	 *     client.
	 */
	getNewToken(oauth2Client, callback) {
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline', // eslint-disable-line camelcase
			scope: this.SCOPES
		});
		console.log('Authorize this app by visiting this url: ', authUrl);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question('Enter the code from that page here: ', code => {
			rl.close();
			oauth2Client.getToken(code, (err, token) => {
				if (err) {
					console.log('Error while trying to retrieve access token', err);
					return;
				}
				oauth2Client.credentials = token;
				this.storeToken(token);
				callback(oauth2Client);
			});
		});
	}

	/**
	 * Store token to disk be used in later program executions.
	 *
	 * @param {Object} token The token to store to disk.
	 */
	storeToken(token) {
		try {
			fs.mkdirSync(this.TOKEN_DIR);
		} catch (err) {
			if (err.code !== 'EEXIST') {
				throw err;
			}
		}
		fs.writeFile(this.TOKEN_PATH, JSON.stringify(token));
		console.log('Token stored to ' + this.TOKEN_PATH);
	}
}

module.exports = GoogleSheetWrite;
