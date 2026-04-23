const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.all("/check", async (req, res) => {
    try {
        const license = req.body?.license || req.query.license;
        const device = req.body?.device || req.query.device;

        // لازم كود + جهاز
        if (!license || !device) {
            return res.json({
                success: false,
                reason: "no_license"
            });
        }

        const BIN_URL = "https://api.jsonbin.io/v3/b/69d1f6e5aaba882197c6ee95";
        const MASTER_KEY = "YOUR_SECRET_KEY";

        // جلب البيانات
        const response = await fetch(`${BIN_URL}/latest`, {
            headers: {
                "X-Master-Key": MASTER_KEY
            }
        });

        const data = await response.json();
        const licenses = data.record?.licenses || [];

        const found = licenses.find(
            l => l.key.trim().toLowerCase() === license.trim().toLowerCase()
        );

        // ❌ غير موجود
        if (!found) {
            return res.json({
                success: false,
                reason: "not_found"
            });
        }

        // ❌ غير مفعل
        if (!found.active) {
            return res.json({
                success: false,
                reason: "inactive"
            });
        }

        // 🔥 ربط الكود بجهاز واحد فقط

        // أول مرة → يربط الجهاز تلقائيًا
        if (!found.device || found.device === "") {
            found.device = device;

            // حفظ التعديل في jsonbin
            await fetch(BIN_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": MASTER_KEY
                },
                body: JSON.stringify({
                    licenses: licenses
                })
            });
        }

        // ❌ إذا الكود مربوط بجهاز آخر
        else if (found.device !== device) {
            return res.json({
                success: false,
                reason: "wrong_device"
            });
        }

        // 🔥 انتهاء الاشتراك
        const now = Date.now();

        if (found.expiresAt && now > found.expiresAt) {
            return res.json({
                success: false,
                reason: "expired"
            });
        }

        // ✔ نجاح
        return res.json({
            success: true,
            license: license
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
