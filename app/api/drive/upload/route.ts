import { NextRequest, NextResponse } from "next/server";
import {
  createDriveFolder,
  uploadFileToDrive,
  getExpenseFolderName,
} from "@/lib/google-drive";
import { neon } from "@neondatabase/serverless";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const expense_id = formData.get("expense_id") as string;
    const description = formData.get("description") as string;
    const disbursed_date = formData.get("disbursed_date") as string;

    if (!expense_id || !description || !disbursed_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parentFolderId = process.env.GDRIVE_EXPENSE_FOLDER_ID;
    if (!parentFolderId) {
      return NextResponse.json({ error: "GDRIVE_EXPENSE_FOLDER_ID not set" }, { status: 500 });
    }

    console.log("[drive/upload] Creating folder for:", description, disbursed_date);

    const [y, m, d] = disbursed_date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const folderName = getExpenseFolderName(date, description);

    const folderId = await createDriveFolder(folderName, parentFolderId);
    console.log("[drive/upload] Folder created:", folderId, folderName);

    const files = formData.getAll("files") as File[];
    const sql = neon(process.env.DATABASE_URL!);

    for (const file of files) {
      if (!file || file.size === 0) continue;
      console.log("[drive/upload] Uploading:", file.name, file.size);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "application/octet-stream";
      const fileId = await uploadFileToDrive(buffer, file.name, mimeType, folderId);
      console.log("[drive/upload] Uploaded fileId:", fileId);
      await sql`
        INSERT INTO expense_attachments (expense_id, file_name, drive_file_id, drive_folder_id, drive_folder_name)
        VALUES (${expense_id}, ${file.name}, ${fileId}, ${folderId}, ${folderName})
      `;
    }

    return NextResponse.json({ success: true, folder_name: folderName, folder_id: folderId });
  } catch (error) {
    console.error("[drive/upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
