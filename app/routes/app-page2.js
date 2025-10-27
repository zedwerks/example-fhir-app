import express from 'express';
import settings from "../settings.js"; // 👈 make sure the .js extension is included

var router = express.Router();

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

export default router;