const functions = require("firebase-functions");
const cors = require('cors')({
  origin: true,
});

const admin = require("firebase-admin");
admin.initializeApp();

function validateRequiredFields(data) {
  const { age, zipcode } = data;
  return age && zipcode;
}

function mapData(data) {
  var mappedData = {};
  for (const key in data){
    mappedData[key] = data[key] || '';
  }
  return mappedData;
}

const FIREBASEAPP = 'https://coronavirustest-f5671.web.app';
const DOMAIN = 'https://covid19mobile.app';
const DOMAINW = 'https://www.covid19mobile.app';
// const FIREBASEAPPDEV = 'https://coronavirus-test-us.web.app';
// const LOCALHOST = "http://localhost:3000";

exports.submit = functions.https.onRequest((req, res) => {
  return cors(req, res, async() => {
    const data = req.body;
    //set JSON content type and CORS headers for the response
    // accepted origins
    const knownOrigins = [FIREBASEAPP, DOMAIN, DOMAINW];
    // read origin
    const origin = req.get('Origin');
    var allowOrigin = DOMAIN;
    if(knownOrigins.includes(origin)){
      allowOrigin = origin;
    }
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', allowOrigin);

    //respond to CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
    }

    // validate required fields
    if(!validateRequiredFields(data)){
      res.status(400).send({ error: 'Bad Request, missing age or zipcode' });
    }
    // mapp values to prevent null or undefined
    const mappedData = mapData(data);
    // save data
    await admin
      .database()
      .ref("/data")
      .push(mappedData);

    // return success
    res.sendStatus(200);
  })
});
