const server = require("./api/server");

const HOST = "localhost";
const PORT = 21727;

server.listen(PORT, () => console.log(`Server running at ${HOST}:${PORT}`));
