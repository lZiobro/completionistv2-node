const server = require("./api/server");

const HOST = "https://completionistv2-node.vercel.app";
const PORT = process?.env?.PORT || 21727;

server.listen(PORT, () => console.log(`Server running at ${HOST}:${PORT}`));
