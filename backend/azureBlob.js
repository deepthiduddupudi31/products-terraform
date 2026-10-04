const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");
const axios = require("axios");
const path = require("path");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = "products";

if (!storageAccountName) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME is missing in .env"
  );
}

const blobServiceClient = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);


// =====================================================
// 1. UPLOAD IMAGE FILE
// =====================================================

async function uploadToBlob(file) {
  if (!file) {
    throw new Error("No image file received");
  }

  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  const extension =
    path.extname(file.originalname) || ".jpg";

  const fileName =
    `product-${Date.now()}${extension}`;

  const blockBlobClient =
    containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType:
        file.mimetype || "application/octet-stream",
    },
  });

  return blockBlobClient.url;
}


// =====================================================
// 2. UPLOAD IMAGE FROM URL
// =====================================================

async function uploadImageFromUrl(imageUrl) {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const contentType =
    response.headers["content-type"] || "image/jpeg";

  let extension = ".jpg";

  if (contentType.includes("png")) {
    extension = ".png";
  } else if (contentType.includes("webp")) {
    extension = ".webp";
  } else if (contentType.includes("gif")) {
    extension = ".gif";
  } else if (contentType.includes("jpeg")) {
    extension = ".jpg";
  }

  const fileName =
    `product-${Date.now()}${extension}`;

  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  const blockBlobClient =
    containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(
    Buffer.from(response.data),
    {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    }
  );

  return blockBlobClient.url;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  uploadToBlob,
  uploadImageFromUrl,
};