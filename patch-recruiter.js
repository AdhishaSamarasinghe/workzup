const fs = require('fs');
let filepath = 'backend/routes/recruiter.js';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
    'const { authenticateToken } = require("../middleware/auth");',
    'const { authenticateToken, requireRole } = require("../middleware/auth");'
);

content = content.replace(
    /authenticateToken, async \(req, res\) =>/g,
    'authenticateToken, requireRole(["EMPLOYER", "RECRUITER"]), async (req, res) =>'
);

fs.writeFileSync(filepath, content);
console.log("Patched recruiter.js with RBAC rules!");
