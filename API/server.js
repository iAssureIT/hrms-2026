const http = require("http");
const app = require("./app"); // app file include
const globalVariable = require("./nodemonConfig.js");
const port = globalVariable.port;
const project = globalVariable.projectName;
const server = http.createServer(app);
server.on("listening", () => {
  console.log("");
  console.log("****************************************");
  console.log("");
  console.log(project + " - API is running on port --> ", port);
  console.log("");
  console.log("****************************************");
  console.log("");
});

server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EADDRINUSE":
      console.error("");
      console.error("************************************************************");
      console.error(`ERROR: Port ${port} is already in use.`);
      console.error("Please terminate the process using this port and try again.");
      console.error("************************************************************");
      console.error("");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.listen(port);
