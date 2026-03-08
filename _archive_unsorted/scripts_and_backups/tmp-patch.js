const fs = require('fs');

function addToken(file) {
    let c = fs.readFileSync(file, 'utf8');

    // Replace headers: { "Content-Type": "application/json" }
    c = c.replace(
        /headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/g,
        'headers: { "Content-Type": "application/json", ...(typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) }'
    );

    // Replace method: "DELETE" without headers
    c = c.replace(
        /method:\s*"DELETE",\s*\n/g,
        'method: "DELETE",\n                headers: { ...(typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },\n'
    );

    fs.writeFileSync(file, c);
    console.log("Patched", file);
}

try {
    addToken('app/employer/create-job/page.tsx');
    addToken('app/employer/edit-job/[id]/page.tsx');
    addToken('app/employer/create-job/my-postings/page.tsx');
} catch (err) {
    console.error(err);
}
