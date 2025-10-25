const { response } = require('express');
var express = require('express');
const { HTTPVersionNotSupported } = require('http-errors');
var router = express.Router();
const settings = require("../settings")

const https = require('https');
const { token } = require('morgan');
const url = require('url');
const fetch = require('node-fetch');

/* GET launch page. */
router.get('/', function (req, res, next) {
    // https://open.epic.com/Launchpad/OAuth2Sso

    // 1. Receive `launch` and `iss` params
    const launch = req.query.launch;
    const issuer = req.query.iss;
    req.session.issuer = issuer;
    console.log(issuer)

    // 2. Query {iss}/metadata to find the auth and token endpoints
    var options = {
        headers: {
            "Accept":"application/json"
        }
    }

    fetch(issuer + "/metadata", options)
    .then(res => res.json())
    .then(json => {
        var extensions = json.rest[0].security.extension[0].extension; 
        extensions.forEach(function(item) {
            if (item.url == "token") {
                req.session.tokenUrl = item.valueUri
            } else if (item.url == "authorize") {
                req.session.authUrl = item.valueUri
            }
        })
        // 3. Redirect to the auth endpoint with
        //    - response_type = "code"
        //    - client_id = client_id (defined above)
        //    - redirect_uri = redirect_url (defined in the above form)
        //    - launch = the launch token (as passed to your web app's launch URL)
        //    - state = <an opaque value used by the client to maintain state between the request and callback.>
        //    - scope = "launch" (this is necessary to indicate the app is launching from the EHR context to enable single sign-on)
        //    which will redirect back to the redirect_uri
        var params = "response_type=code&"
        params += `client_id=${settings.clientID}&`
        params += `redirect_uri=${settings.callbackUrl}&`
        params += `launch=${launch}&`
        params += "scope=launch&"
        console.log(`Redirecting to ${req.session.authUrl}?${params}`)
        res.redirect(`${req.session.authUrl}?${params}`);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

module.exports = router;