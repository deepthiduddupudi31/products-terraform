const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://proud-bay-0ae813b00.5.azurestaticapps.net",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ProductHub API is running successfully"
  });
});


app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);


app.listen(PORT, () => {
  console.log(
    `ProductHub backend running on port ${PORT}`
  );
});