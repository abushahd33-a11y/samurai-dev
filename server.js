const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.all("/check", async (req, res) => {
    try {
        // يدعم GET و POST
        const license = req.body?.license || req.query.license;
        const device = req.body?.device || req.query.device;

        if (!license) {
            return res.json({ success: false });
        }

        // الاتصال بـ jsonbin
        const response = await fetch("https://api.jsonbin.io/v3/b/69d1f6e5aaba882197c6ee95/latest", {
            headers: {
                "X-Master-Key": "YOUR_SECRET_KEY"
            }
        });

        const data = await response.json();

        res.json({
            success: true,
            license: license,
            data: data
        });

    } catch (e) {
        res.json({ success: false });
    }
});

// مهم لـ Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running...");
});
