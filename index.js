const server = require("./api/server.js");

const HOST = process?.env?.VERCEL_URL || "localhost";
const PORT = process?.env?.PORT || 21727;

server.listen(PORT, () => console.log(`Server running at ${HOST}:${PORT}`));
