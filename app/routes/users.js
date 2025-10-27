import express from 'express';
import settings from "../settings.js"; // 👈 make sure the .js extension is included
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
