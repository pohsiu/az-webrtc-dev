/* eslint-disable */
// https://developers.google.com/gmail/api/quickstart/nodejs?refresh=1
// https://stackoverflow.com/questions/34546142/gmail-api-for-sending-mails-in-node-js
// https://stackoverflow.com/questions/50540051/gmail-api-send-text-and-html-in-one-mail
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://mail.google.com/',
  // 'https://www.googleapis.com/auth/gmail.modify',
  // 'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
];
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log(`The API returned an error: ${err}`);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}


function makeBody(to, from, subject, message) {
  const str = [
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    'To: ', to, '\n',
    'From: ', from, '\n',
    'Subject: ', subject, '\n',
    'Content-Type: multipart/mixed; boundary=012boundary01\n\n',
    '--012boundary01\n',
    'Content-Type: multipart/alternative; boundary=012boundary02\n\n',
    '--012boundary02\n',
    'Content-type: text/plain; charset=UTF-8\n\n',
    'Hello plain text!\n\n',
    '--012boundary02\n',
    'Content-type: text/html; charset=UTF-8\n',
    'Content-Transfer-Encoding: quoted-printable\n\n',
    '<b>Hello html</b>\n\n',
    '--012boundary02--\n',
    '--012boundary01\n',
    'Content-type: text/html; charset=UTF-8\n',
    'Content-Disposition: attachment; filename="sample.html"\n',
    'Content-Transfer-Encoding: quoted-printable\n\n',
    '<b>HTML sample attachment file</b>\n',
    '--012boundary01\n',
    'Content-type: text/html; charset=UTF-8\n',
    'Content-Disposition: attachment; filename="sample.html"\n',
    'Content-Transfer-Encoding: quoted-printable\n\n',
    '<b>HTML sample attachment file</b>\n',
    '--012boundary01--\n',
  ].join('');

  const encodedMail = Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return encodedMail;
}

function sendMessage(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = makeBody('xtforgame@gmail.com', 'XXX Team <rick.chen@d8ai.com>', 'test subject', 'test message');
  gmail.users.messages.send({
    auth,
    userId: 'me',
    resource: {
      raw,
    },
  }, (err, response) => {
    // res.send(err || response);
  });
}

const start = () => {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    // authorize(JSON.parse(content), listLabels);
    authorize(JSON.parse(content), sendMessage);
  });
};

export default start;


start();
