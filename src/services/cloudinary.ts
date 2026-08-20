import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import logger from "../logger.ts";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder = "announcements",
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });

    logger.info(
      {
        publicId: result.public_id,
        url: result.secure_url,
        bytes: result.bytes,
        format: result.format,
      },
      "File successfully uploaded to Cloudinary",
    );

    await fs.unlink(filePath);

    return result.secure_url;
  } catch (error) {
    logger.error(
      { error, filePath },
      "Failed to upload file to Cloudinary",
    );

    await fs.unlink(filePath).catch(() => {});

    throw error;
  }
};
