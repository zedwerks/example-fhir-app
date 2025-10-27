import express from 'express';
var router = express.Router();


function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");

  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}


/* GET home page. */
router.get('/', function(req, res, next) {

    console.log("Launched route accessed");

  const response = req.session.tokenResponse || {};
  const title = 'Demo SMART App';
  const subtitle = 'Launched from EMR - authenticated with Keycloak SMART on FHIR';
  const tokenResponse = JSON.stringify(response, null, 2);
  const accessTokenJson = decodeJwt(req.session.access_token || {});
  const accessToken = JSON.stringify(accessTokenJson, null, 2);
  const fhirContext = req.session.fhir_context || {};

  res.render('launched', { title, subtitle, tokenResponse, accessToken });
});

export default router; // or module.exports = router;