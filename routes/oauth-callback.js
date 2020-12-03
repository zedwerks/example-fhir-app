const express = require('express');
const router = express.Router();
const settings = require("../settings")
const fetch = require('node-fetch');

/* GET launch page. */
router.get('/', function(req, res, next) {
 // https://open.epic.com/Launchpad/OAuth2Sso
    // 4. POST to the token service:
    //    - grant_type = "authorization_code"
    //    - code = the authorization code your web app received
    //    - redirect_uri = redirect_url (defined in the above form)
    //    - client_id = client_id (defined in the above form)
    //    which will return access token
    // 5. Use the token as Bearer: {token} to make subsequent FHIR calls
    console.log(`got a code: ${req.query.code}`)
    const { URLSearchParams } = require('url');
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code")
    params.append("code", `${req.query.code}`);
    params.append("redirect_uri", `${settings.callbackUrl}`)
    params.append("client_id", `${settings.clientID}`)
    console.log(`Sending to ${req.session.tokenUrl}, params ${params}`)

    var headers = {
        "Accept":"application/json"
    }
    
    fetch(req.session.tokenUrl, { method: 'POST', body: params, headers: headers })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        req.session.patient_id = data.patient;
        req.session.access_token = data.access_token;  
        res.redirect('/app/index')              
    })
    .catch((error) => {
        console.error('Error:', error);
    });            
});

module.exports = router;