const path = require("path");
const express = require("express");

const router = express.Router();

// API documentation.

const SPEC = path.join(__dirname, "..", "..", "docs", "openapi.yaml");
const UI = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.0";

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Shahebbazar API</title>
<link rel="stylesheet" href="${UI}/swagger-ui.css"
      integrity="sha384-Ov4/wv3j2bmct8cDc5X4ngJZohVPzEmc6uDPH8WeljUxO5vtoykvMEfbu9Vh6RaW" crossorigin="anonymous">
<style>body { margin: 0; background: #fff; } .swagger-ui .topbar { display: none; }</style>
</head>
<body>
<div id="ui"></div>
<script src="${UI}/swagger-ui-bundle.js"
        integrity="sha384-YDALVcy8kj8yltLBVi1vBiBAUqdxvus673gM8XKwiy6aDUJFXivF/KCufekjYbVf" crossorigin="anonymous"></script>
<script>
  SwaggerUIBundle({ url: "/api/openapi.yaml", dom_id: "#ui", deepLinking: true, docExpansion: "none", tryItOutEnabled: false });
</script>
</body>
</html>`;

router.get("/openapi.yaml", (req, res) => {
    res.type("application/yaml").sendFile(SPEC, (err) => {
        if (err && !res.headersSent) res.status(404).json({ error: "docs/openapi.yaml not found" });
    });
});

router.get("/docs", (req, res) => {
    res.type("html").send(PAGE);
});

module.exports = router;
