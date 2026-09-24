import app from "./app.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLIENT_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_CLIENT_API || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_CLIENT_SECRET || process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running at http://0.0.0.0:${PORT}`);
});
