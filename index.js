const server = require("./api/server");

const HOST = "completionistv2-node.vercel.app";
const PORT = 21727;

server.listen(PORT, () => console.log(`Server running at ${HOST}:${PORT}`));
