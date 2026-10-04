const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ProductHub API is running on server successfully"
  });
});


app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);


app.listen(PORT, () => {
  console.log(
    `ProductHub backend running on port ${PORT}`
  );
});