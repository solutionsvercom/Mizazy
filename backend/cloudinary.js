import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return false;
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
  configured = true;
  return true;
}

export function isCloudinaryReady() {
  return configured || configureCloudinary();
}

export function getCloudinaryFolder(subfolder = "products") {
  const base = process.env.CLOUDINARY_FOLDER || "mizazy";
  return `${base}/${subfolder}`.replace(/\/+/g, "/");
}

export function uploadBuffer(buffer, options = {}) {
  if (!isCloudinaryReady()) {
    return Promise.reject(new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars."));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: getCloudinaryFolder(options.folder || "products"),
        resource_type: "image",
        overwrite: false,
        ...options.cloudinary,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteByPublicId(publicId) {
  if (!isCloudinaryReady()) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export { cloudinary };
