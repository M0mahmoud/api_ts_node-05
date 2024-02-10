import axios from "axios";
import express, { json } from "express";
import requestIP from "request-ip";

const app = express();
app.use(json());

// Set up CORS headers
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/", (req, res) => {
  const ipAddresses = req.header("x-forwarded-for");
  const getClie = requestIP.getClientIp(req);

  res.json({
    msg: "Server running...",
    ipAddresses,
    getClie,
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
