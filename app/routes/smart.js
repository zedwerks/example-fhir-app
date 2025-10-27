import express from "express";
import fetch from "node-fetch";
import settings from "../settings.js"; // 👈 make sure the .js extension is included

const router = express.Router();

/* GET launch page. */
router.get("/", async (req, res, next) => {
  try {
    const options = {
      headers: {
        "Authorization": `Bearer ${req.session.access_token}`,
        "Accept": "application/json",
      },
    };

    // Fetch patient info from FHIR server
    const response = await fetch(
      `${req.session.issuer}/Patient/${req.session.patient_id}`,
      options
    );

    if (!response.ok) {
      throw new Error(`FHIR fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("FHIR Patient Data:", data);

    req.session.patient = data;

    res.render("smart", {
      layout: "app-layout",
      template: "app",
      title: "Example FHIR App",
      patient: JSON.stringify(req.session.patient),
      patient_name: req.session.patient?.name?.[0]?.text || "Unknown",
    });
  } catch (error) {
    console.error("Error in route:", error);
    next(error);
  }
});

export default router;