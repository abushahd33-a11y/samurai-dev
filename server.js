const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.all("/check", async (req, res) => {
    try {
        const { license, device } = req.body;

        // تحقق بسيط (تقدر تطوره)
        if (!license || !device) {
            return res.json({ success: false });
        }

        // الاتصال الحقيقي (مخفي)
        const response = await fetch("https://api.jsonbin.io/v3/b/69d1f6e5aaba882197c6ee95/latest", {
            headers: {
                "X-Master-Key": "YOUR_SECRET_KEY"
            }
        });

        const data = await response.json();

        res.json({
            success: true,
            data: data
        });

    } catch (e) {
        res.json({ success: false });
    }
});

app.listen(3000, () => {
    console.log("Server running...");
});
