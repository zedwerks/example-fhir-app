import express from 'express';
var router = express.Router();


// Default route
router.get("/", (req, res) => {
  res.render("index", {
    title: "Demo SMART App",
    message: "This will be used to illustrate EHR Launch from the EMR."
  });
});


export default router;
