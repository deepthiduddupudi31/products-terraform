const { sql, poolPromise } = require("../db");
const { uploadToBlob } = require("../azureBlob");


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        p.Id,
        p.ProductName,
        p.Description,
        p.ImageUrl,
        p.PdfUrl,
        p.CreatedAt,
        u.Name AS UploadedBy
      FROM Products p
      INNER JOIN Users u
        ON p.UserId = u.Id
      ORDER BY p.CreatedAt DESC
    `);

    res.json({
      success: true,
      products: result.recordset
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};


// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      productName,
      description
    } = req.body;

    const imageFile =
      req.files?.image?.[0];

    const pdfFile =
      req.files?.pdf?.[0];

    // Validate text fields
    if (!productName || !description) {
      return res.status(400).json({
        success: false,
        message: "Product name and description are required"
      });
    }

    // Validate image
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    // Validate PDF
    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: "Product PDF is required"
      });
    }

    console.log("Uploading image to Azure Blob...");

    const imageUrl =
      await uploadToBlob(imageFile);

    console.log("Image uploaded:", imageUrl);

    console.log("Uploading PDF to Azure Blob...");

    const pdfUrl =
      await uploadToBlob(pdfFile);

    console.log("PDF uploaded:", pdfUrl);

    // Save URLs in Azure SQL
    const pool = await poolPromise;

    await pool
      .request()
      .input(
        "UserId",
        sql.Int,
        req.user.userId
      )
      .input(
        "ProductName",
        sql.VarChar(255),
        productName
      )
      .input(
        "Description",
        sql.VarChar(sql.MAX),
        description
      )
      .input(
        "ImageUrl",
        sql.VarChar(500),
        imageUrl
      )
      .input(
        "PdfUrl",
        sql.VarChar(500),
        pdfUrl
      )
      .query(`
        INSERT INTO Products
        (
          UserId,
          ProductName,
          Description,
          ImageUrl,
          PdfUrl
        )
        VALUES
        (
          @UserId,
          @ProductName,
          @Description,
          @ImageUrl,
          @PdfUrl
        )
      `);

    res.status(201).json({
      success: true,
      message: "Product uploaded successfully",
      product: {
        productName,
        description,
        imageUrl,
        pdfUrl
      }
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload product",
      error: error.message
    });
  }
};


module.exports = {
  getProducts,
  createProduct
};