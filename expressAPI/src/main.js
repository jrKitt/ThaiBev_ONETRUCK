const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running and ready to use.");
});

// app.use("/api", Routes);


app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
