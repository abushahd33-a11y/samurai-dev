const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const BIN_ID = "69d1f6e5aaba882197c6ee95";
const MASTER_KEY = "YOUR_SECRET_KEY";

app.all("/check", async (req, res) => {
    try {
        // يدعم GET و POST
        const license = req.body?.license || req.query.license;
        const device = req.body?.device || req.query.device;

        // لازم كود + جهاز
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

        // 🔥 ربط الكود بجهاز واحد فقط
        // أول استخدام → يتم ربط الجهاز تلقائيًا
        if (!found.device || found.device === "") {
            found.device = device;

            // حفظ التعديل في jsonbin
            await fetch(
                `https://api.jsonbin.io/v3/b/${BIN_ID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Master-Key": MASTER_KEY
                    },
                    body: JSON.stringify({
                        licenses: licenses
                    })
                }
            );
        }
        // ❌ الكود مربوط بجهاز آخر
        else if (found.device !== device) {
            return res.json({
                success: false,
                reason: "wrong_device"
            });
        }

        // 🔥 التحقق من انتهاء المدة
        const now = Date.now();

        if (found.expiresAt && now > found.expiresAt) {
            return res.json({
                success: false,
                reason: "expired" // ← انتهى الاشتراك
            });
        }

        // ✔ نجاح
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

// مهم لـ Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running...");
});
