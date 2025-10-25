var express = require('express');
var router = express.Router();
const settings = require("../settings")
const fetch = require('node-fetch');

/* GET launch page. */
router.get('/', function(req, res, next) {
    var options = {
        //TODO: put this somewhere so I don't need to put this on every page
        headers: {
            "Authorization": `Bearer ${req.session.access_token}`,
            "Epic-Client-ID": `${settings.clientID}`,
            "Accept": "application/json"
        }
    }
    var patient
    //api/FHIR/DSTU2/Patient/{ID}
    fetch(`${req.session.issuer}/Patient/${req.session.patient_id}`, options)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        req.session.patient = data
        res.render('app-index', {
            layout: 'app-layout', 
            template: 'app',
            title: 'Example FHIR App',
            patient: JSON.stringify(req.session.patient),
            patient_name: req.session.patient.name[0].text
        });
    })
    .catch(error => console.error(`Error: ${error}`))
});

module.exports = router;