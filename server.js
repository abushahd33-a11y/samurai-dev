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

const licenses = data.record.licenses;

// ابحث عن الكود
const found = licenses.find(l => l.key === license);

if (!found) {
    return res.json({ success: false });
}

// تحقق إذا مفعل
if (!found.active) {
    return res.json({ success: false });
}

// نجاح
res.json({
    success: true,
    license: license
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
