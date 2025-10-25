var express = require('express');
var router = express.Router();
const settings = require("../settings")
// const fetch = require('node-fetch');

/* GET launch page. */
router.get('/', function(req, res, next) {
    res.render('app-page2', {
        layout: 'app-layout', 
        template: 'app',
        title: 'Example FHIR App',
        patient: JSON.stringify(req.session.patient),
        patient_name: req.session.patient.name[0].text
    });
});

module.exports = router;