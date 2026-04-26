const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const BIN_ID = "69d1f6e5aaba882197c6ee95";
const MASTER_KEY = "YOUR_SECRET_KEY";

app.all("/check", async (req, res) => {
    try {
        // قراءة الكود + الجهاز
        const license = req.body?.license || req.query.license;
        const device = req.body?.device || req.query.device;

        // لازم وجود الكود + الجهاز
        if (!license || !device) {
            return res.json({
                success: false,
                reason: "no_license"
            });
        }

        // جلب البيانات من jsonbin
        const response = await fetch(
            `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
            {
                headers: {
                    "X-Master-Key": MASTER_KEY
                }
            }
        );

        const data = await response.json();
        const licenses = data.record?.licenses || [];

        // البحث عن الكود
        const found = licenses.find(
            l => l.key.trim().toLowerCase() === license.trim().toLowerCase()
        );

        // ❌ الكود غير موجود
        if (!found) {
            return res.json({
                success: false,
                reason: "not_found"
            });
        }

        // ❌ الكود غير مفعل
        if (!found.active) {
            return res.json({
                success: false,
                reason: "inactive"
            });
        }

        // ❌ الجهاز مختلف
        if (!found.device || found.device.trim() !== device.trim()) {
            return res.json({
                success: false,
                reason: "wrong_device"
            });
        }

        // ❌ انتهت مدة الاشتراك
        const now = Date.now();

        if (found.expiresAt && now > found.expiresAt) {
            return res.json({
                success: false,
                reason: "expired"
            });
        }

        // ✔ نجاح كامل
        return res.json({
            success: true,
            license: license,
            expiresAt: found.expiresAt || null
        });

    } catch (e) {
        console.log(e);

        return res.json({
            success: false,
            reason: "server_error"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running...");
});
