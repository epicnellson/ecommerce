let cloudinary;

const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME &&
         process.env.CLOUDINARY_API_KEY &&
         process.env.CLOUDINARY_API_SECRET;
};

async function getCloudinary() {
  if (!cloudinary && isCloudinaryConfigured()) {
    const mod = await import('cloudinary');
    cloudinary = mod.v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinary;
}

const uploadImage = async (filePath) => {
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary is not configured');
    error.statusCode = 500;
    throw error;
  }

  const cloudinaryClient = await getCloudinary();

  try {
    const result = await cloudinaryClient.uploader.upload(filePath, {
      folder: 'ecommerce',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const err = new Error('Failed to upload image');
    err.statusCode = 500;
    throw err;
  }
};

const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  const cloudinaryClient = await getCloudinary();

  try {
    await cloudinaryClient.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export { uploadImage, deleteImage };
