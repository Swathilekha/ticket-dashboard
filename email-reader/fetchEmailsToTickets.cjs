require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Gmail API setup
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('Error loading credentials:', err);
  authorize(JSON.parse(content), fetchEmails);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this URL:', authUrl);
  }
}

async function fetchEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
  const messages = res.data.messages;

  if (!messages || messages.length === 0) {
    console.log('No messages found.');
    return;
  }

  for (const msg of messages) {
    const msgData = await gmail.users.messages.get({ userId: 'me', id: msg.id });
    const headers = msgData.data.payload.headers;

    const from = headers.find(h => h.name === 'From')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const body = msgData.data.snippet || '';
    const senderEmail = from.match(/<(.+)>/)?.[1] || from;

    // 🔍 Fetch user from auth.users using Supabase Admin API
    const { data: usersList, error: userError } = await supabase.auth.admin.listUsers({ email: senderEmail });

    if (userError || !usersList || usersList.users.length === 0) {
      console.log(`❌ No auth user found for ${senderEmail}`);
      continue;
    }

    const customer_id = usersList.users[0].id;

    const { error } = await supabase.from('tickets').insert([
      {
        customer_id,
        subject,
        description: `Email from: ${from}\n\n${body}`,
        status: 'pending'
      }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
    } else {
      console.log(`✅ Ticket created for user ${senderEmail}`);
    }
  }
}
