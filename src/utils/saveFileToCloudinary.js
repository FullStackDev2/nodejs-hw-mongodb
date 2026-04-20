import cloudinary from './cloudinary.js';

const saveFileToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'contacts',
  });

  return result.secure_url;
};

export default saveFileToCloudinary;