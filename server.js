const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.all("/check", async (req, res) => {
try {
const license = req.body?.license || req.query.license;

if (!license) {  
        return res.json({ success: false, reason: "no_license" });  
    }  

    const response = await fetch("https://api.jsonbin.io/v3/b/69d1f6e5aaba882197c6ee95/latest", {  
        headers: {  
            "X-Master-Key": "YOUR_SECRET_KEY"  
        }  
    });  

    const data = await response.json();  
    const licenses = data.record?.licenses || [];  

    const found = licenses.find(l => l.key === license);  

    if (!found) {  
        return res.json({ success: false, reason: "not_found" });  
    }  

    if (!found.active) {  
        return res.json({ success: false, reason: "inactive" });  
    }  

    const now = Date.now();  

    if (found.expiresAt && now > found.expiresAt) {  
        return res.json({ success: false, reason: "expired" });  
    }  

    return res.json({  
        success: true,  
        license: license  
    });  

} catch (e) {  
    return res.json({ success: false, reason: "server_error" });  
}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server running...");
});
