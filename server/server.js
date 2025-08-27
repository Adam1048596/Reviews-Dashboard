// import EXPRESS & routers
const express = require("express");
const cors = require("cors");
const hostaway = require("./routes/hostaway");
const PORT = 5000;


// Create an Express application instance
const server = express();

server.use(cors());
server.use(express.json());

// Routes
server.use("/api/reviews", hostaway);



// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});