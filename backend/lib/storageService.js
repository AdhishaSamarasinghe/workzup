const path = require("path");
const { getSupabaseAdmin } = require("./supabaseAdmin");

/**
 * Upload a file memory buffer to the Supabase storage bucket 'uploads'
 *
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} originalName - Original filename (e.g., 'resume.pdf') to extract the extension.
 * @param {string} folder - The destination folder within the 'uploads' bucket (e.g., 'cvs', 'avatars').
 * @param {string} mimetype - The file MIME type.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
async function uploadToSupabase(fileBuffer, originalName, folder, mimetype) {
  const admin = getSupabaseAdmin();
  
  // Generate a unique filename using timestamp and random string
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName);
  const filename = `${uniqueSuffix}${ext}`;
  
  // Construct destination path inside the root 'uploads' bucket
  // e.g., folder="cvs", filename="162389123-12839.pdf" -> "cvs/162389123-12839.pdf"
  const folderStr = (folder || "").trim();
  const filePath = folderStr ? `${folderStr}/${filename}` : filename;

  // Upload to Supabase 'uploads' bucket using Admin privileges
  const { error } = await admin.storage
    .from("uploads")
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Retrieve the public URL
  const { data } = admin.storage.from("uploads").getPublicUrl(filePath);
  
  return data.publicUrl;
}

module.exports = {
  uploadToSupabase,
};
