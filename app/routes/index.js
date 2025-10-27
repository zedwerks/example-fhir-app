import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  const tokenResponse = req.session.tokenResponse || {};
  console.log("Index route accessed");
  res.render('index', { title: 'Demo SMART App', subtitle: 'Welcome to the Example FHIR App', tokenResponse: JSON.stringify(tokenResponse) });
});

export default router; // or module.exports = router;