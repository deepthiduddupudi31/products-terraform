const express = require("express");

const {
  sql,
  poolPromise,
} = require("../db");

const {
  uploadToBlob,
  uploadImageFromUrl,
} = require("../azureBlob");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// ==================================================
// GET ALL PRODUCTS
// ==================================================

router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        Id,
        Name,
        Description,
        Image,
        Pdf
      FROM Products
      ORDER BY Id DESC
    `);

    res.status(200).json({
      success: true,
      products: result.recordset,
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});


// ==================================================
// GET PRODUCT BY ID
// ==================================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT
          Id,
          Name,
          Description,
          Image,
          Pdf
        FROM Products
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product: result.recordset[0],
    });

  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});


// ==================================================
// CREATE PRODUCT
// ==================================================

router.post(
  "/",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {

      console.log("=================================");
      console.log("CREATE PRODUCT");
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);
      console.log("=================================");


      // ----------------------------------------------
      // GET DATA
      // ----------------------------------------------

      const name = req.body?.name?.trim();

      const description =
        req.body?.description?.trim();

      const imageUrlFromBody =
        req.body?.image?.trim();


      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Product description is required",
        });
      }


      // ----------------------------------------------
      // IMAGE
      // ----------------------------------------------

      let imageUrl = null;

      if (
        req.files?.image &&
        req.files.image.length > 0
      ) {

        console.log("Uploading image...");

        imageUrl = await uploadToBlob(
          req.files.image[0]
        );

        console.log(
          "Image uploaded:",
          imageUrl
        );

      } else if (imageUrlFromBody) {

        console.log(
          "Uploading image from URL..."
        );

        imageUrl =
          await uploadImageFromUrl(
            imageUrlFromBody
          );

        console.log(
          "Image uploaded:",
          imageUrl
        );
      }


      // ----------------------------------------------
      // PDF
      // ----------------------------------------------

      let pdfUrl = null;

      if (
        req.files?.pdf &&
        req.files.pdf.length > 0
      ) {

        console.log("Uploading PDF...");

        pdfUrl = await uploadToBlob(
          req.files.pdf[0]
        );

        console.log(
          "PDF uploaded:",
          pdfUrl
        );
      }


      // ----------------------------------------------
      // DATABASE
      // ----------------------------------------------

      console.log(
        "Saving product to database..."
      );

      const pool = await poolPromise;

      const result = await pool
        .request()

        .input(
          "name",
          sql.VarChar(255),
          name
        )

        .input(
          "description",
          sql.VarChar(sql.MAX),
          description
        )

        .input(
          "image",
          sql.VarChar(sql.MAX),
          imageUrl
        )

        .input(
          "pdf",
          sql.VarChar(sql.MAX),
          pdfUrl
        )

        .query(`
          INSERT INTO Products
          (
            Name,
            Description,
            Image,
            Pdf
          )
          OUTPUT
            INSERTED.Id,
            INSERTED.Name,
            INSERTED.Description,
            INSERTED.Image,
            INSERTED.Pdf
          VALUES
          (
            @name,
            @description,
            @image,
            @pdf
          )
        `);


      // ----------------------------------------------
      // RESPONSE
      // ----------------------------------------------

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product: result.recordset[0],
      });

    } catch (error) {

      console.error(
        "Create product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message,
      });
    }
  }
);


// ==================================================
// IMAGE UPLOAD
// ==================================================

router.post(
  "/upload",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  async (req, res) => {

    try {

      // IMAGE FILE

      if (
        req.files?.image &&
        req.files.image.length > 0
      ) {

        const url = await uploadToBlob(
          req.files.image[0]
        );

        return res.status(200).json({
          success: true,
          message: "Image uploaded successfully",
          type: "file",
          url,
        });
      }


      // IMAGE URL

      const imageUrl =
        req.body?.image?.trim();

      if (imageUrl) {

        const url =
          await uploadImageFromUrl(
            imageUrl
          );

        return res.status(200).json({
          success: true,
          message: "Image uploaded successfully",
          type: "url",
          url,
        });
      }


      return res.status(400).json({
        success: false,
        message:
          "Please provide an image file or image URL",
      });

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);


module.exports = router;