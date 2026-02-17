const express = require("express");
const router = express.Router();

router.get("/key",(req, res) => {
    res.json({key:process.env.GOOGLE_MAPS_API_KEY})
});

module.exports = router;