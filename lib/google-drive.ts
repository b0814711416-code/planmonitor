import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

export function getExpenseFolderName(date: Date, description: string): string {
  const buddhistYear = (date.getFullYear() + 543) % 100;
  const yy = String(buddhistYear).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const safeName = description.trim().slice(0, 60);
  return `${yy}${mm}${dd}_${safeName}`;
}

export async function createDriveFolder(
  name: string,
  parentId: string
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  if (!res.data.id) throw new Error("Failed to create folder in Google Drive");
  return res.data.id;
}

export async function uploadFileToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: string
): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: "id",
  });
  if (!res.data.id) throw new Error("Failed to upload file to Google Drive");
  return res.data.id;
}

export async function deleteDriveFolder(folderId: string): Promise<void> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  await drive.files.delete({ fileId: folderId });
}
