import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  const response = req.session.tokenResponse || {};
  const title = 'Demo SMART App';
  const subtitle = 'Welcome to the Example FHIR App';
  const tokenResponse = JSON.stringify(response, null, 2);
  console.log("Launched route accessed");
  res.render('launched', { title, subtitle, tokenResponse });
});

export default router; // or module.exports = router;