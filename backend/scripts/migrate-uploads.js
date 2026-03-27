require("dotenv").config();
const fs = require("fs");
const path = require("path");
const prisma = require("../prismaClient");
const { uploadToSupabase } = require("../lib/storageService");

async function migrateFile(localPath, folder) {
  if (!localPath || typeof localPath !== "string") return localPath;
  
  const normalizedPath = localPath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalizedPath.startsWith("http")) return localPath; 
  if (!normalizedPath.startsWith("uploads")) return localPath;

  const fullPath = path.join(__dirname, "..", normalizedPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found at ${fullPath}, skipping...`);
    return localPath;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const ext = path.extname(normalizedPath).toLowerCase();
  
  let mimetype = "application/octet-stream";
  if (ext === ".png") mimetype = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mimetype = "image/jpeg";
  if (ext === ".pdf") mimetype = "application/pdf";
  if (ext === ".doc") mimetype = "application/msword";
  if (ext === ".docx") mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  try {
    const originalName = path.basename(normalizedPath);
    console.log(`Uploading: ${originalName} -> Supabase ${folder}/`);
    const newUrl = await uploadToSupabase(fileBuffer, originalName, folder, mimetype);
    return newUrl;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error.message);
    return localPath;
  }
}

async function run() {
  console.log("Starting Migration of Local /uploads files to Supabase Storage...");

  try {
    // 1. Migrate Users (CVs, IDs)
    const users = await prisma.user.findMany();
    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      if (user.cv && user.cv.startsWith("uploads")) {
        updateData.cv = await migrateFile(user.cv, "cvs");
        needsUpdate = true;
      }
      if (user.idDocument && user.idDocument.startsWith("uploads")) {
        updateData.idDocument = await migrateFile(user.idDocument, "idDocuments");
        needsUpdate = true;
      }
      if (user.idFront && user.idFront.startsWith("uploads")) {
        updateData.idFront = await migrateFile(user.idFront, "idFronts");
        needsUpdate = true;
      }
      if (user.idBack && user.idBack.startsWith("uploads")) {
        updateData.idBack = await migrateFile(user.idBack, "idBacks");
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
        console.log(`Updated User: ${user.email}`);
      }
    }

    // 2. Migrate Avatars (SeekerProfiles)
    const profiles = await prisma.seekerProfile.findMany();
    for (const profile of profiles) {
      if (profile.socialLinks && typeof profile.socialLinks === "object" && profile.socialLinks.avatarUrl) {
        const avatarUrl = profile.socialLinks.avatarUrl;
        if (typeof avatarUrl === "string" && avatarUrl.startsWith("uploads")) {
          const newAvatarUrl = await migrateFile(avatarUrl, "avatars");
          
          await prisma.seekerProfile.update({
            where: { id: profile.id },
            data: {
              socialLinks: {
                ...profile.socialLinks,
                avatarUrl: newAvatarUrl
              }
            }
          });
          console.log(`Updated Profile Avatar for user: ${profile.userId}`);
        }
      }
    }

    // 3. Migrate Company Logos
    const companies = await prisma.company.findMany();
    for (const company of companies) {
      if (company.logoUrl && company.logoUrl.startsWith("uploads")) {
        const newLogoUrl = await migrateFile(company.logoUrl, "companyLogos");
        await prisma.company.update({
          where: { id: company.id },
          data: { logoUrl: newLogoUrl }
        });
        console.log(`Updated Company Logo: ${company.name}`);
      }
    }

    console.log("Migration Complete!");
  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
