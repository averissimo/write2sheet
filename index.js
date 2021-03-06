const path = require('path');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

const Promise = require('promise');

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
	 */
	constructor(key) {
		this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
		this.TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
			process.env.USERPROFILE) + '/.credentials/';
		this.TOKEN_PATH = this.TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
		this.SECRET_PATH = path.join('.', 'client_secret.json');
		if (!fs.existsSync(this.SECRET_PATH)) {
			throw new Error('credentials.json does not exists, please create a desktop API token on https://developers.google.com/sheets/api/quickstart/nodejs (see \'Authorizing requests with OAuth 2.0\').');
		}

		this.sheetsKey = key;
		this.promise = new Promise(resolve => {
			const content = fs.readFileSync(path.resolve('.', 'client_secret.json'));
			this.authorize(JSON.parse(content), () => {
				console.log('Authorization successful!');
				resolve();
			});
		});
	}

	/**
	 * Get authorization and call the method that reads the sheet.
	 *
	 * @param  {String} range  Range in sheet, ex: C1:D
	 * @return {Promise} a Promise that solves when data is written
	 */
	read(range) {
		// Load client secrets from a local file.
		return new Promise((resolve, reject) => {
			this.promise.then(() => {
				fs.readFile('client_secret.json', (err, content) => {
					if (err) {
						console.log('Error loading client secret file: ' + err);
						return;
					}

					// Authorize a client with the loaded credentials, then call the
					// Google Sheets API.
					this.authorize(JSON.parse(content), auth => {
						return this.readSheet(auth, range)
							.then(response => resolve(response))
							.catch(error => reject(error));
					});
				});
			});
		});
	}

	/**
	 * Get authorization and call the method that updates the sheet.
	 *
	 * Note: it does not verify if data size is same or compatible as range.
	 * @param  {[any]} values Data to be written to range
	 * @param  {String} range  Range in sheet, ex: C1:D
	 * @return {Promise} a Promise that solves when data is written
	 */
	write(values, range) {
		// Load client secrets from a local file.
		return new Promise((resolve, reject) => {
			this.promise.then(() => {
				fs.readFile('client_secret.json', (err, content) => {
					if (err) {
						console.log('Error loading client secret file: ' + err);
						return;
					}

					// Authorize a client with the loaded credentials, then call the
					// Google Sheets API.
					this.authorize(JSON.parse(content), auth => {
						return this.updateSheet(auth, values, range)
							.then(response => resolve(response))
							.catch(error => reject(error));
					});
				});
			});
		});
	}

	/**
	 * Updates the sheet with the new data
	 * @param  {[type]} auth   authorization
	 * @param  {[type]} range  range where to write
	 * @return {[Promise]} a Promise that solves when data is written
	 */
	readSheet(auth, range) {
		const sheets = google.sheets({version: 'v4', auth});
		// Write to sheet
		const request = {
			auth,
			spreadsheetId: this.sheetsKey,
			range
		};
		return new Promise((resolve, reject) => {
			sheets.spreadsheets.values.get(request, (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response.data.values);
				}
			});
		});
	}

	/**
	 * Updates the sheet with the new data
	 * @param  {[type]} auth   authorization
	 * @param  {[type]} values data to be written
	 * @param  {[type]} range  range where to write
	 * @return {[Promise]} a Promise that solves when data is written
	 */
	updateSheet(auth, values, range) {
		const sheets = google.sheets({version: 'v4', auth});
		// Write to sheet
		const request = {
			auth,
			spreadsheetId: this.sheetsKey,
			valueInputOption: 'USER_ENTERED',
			range,
			resource: {
				values
			}
		};
		return new Promise((resolve, reject) => {
			sheets.spreadsheets.values.update(request, err => {
				if (err) {
					reject(err);
				} else {
					resolve('INFO:: Finished writing to: ' + range);
				}
			});
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
		const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

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

		console.log('Authorize this app by visiting this url:', authUrl);
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
		} catch (error) {
			if (error.code !== 'EEXIST') {
				throw error;
			}
		}

		fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(token));
		console.log('Token stored to ' + this.TOKEN_PATH);
	}
}

module.exports = GoogleSheetWrite;
