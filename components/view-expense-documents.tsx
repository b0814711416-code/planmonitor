"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, FileText, FolderOpen } from "lucide-react";

interface Attachment {
  id: string;
  file_name: string;
  drive_file_id: string;
  drive_folder_id: string;
  drive_folder_name: string;
}

interface Props {
  attachments: Attachment[];
  description: string;
}

export function ViewExpenseDocuments({ attachments, description }: Props) {
  const [open, setOpen] = useState(false);

  if (attachments.length === 0) return null;

  const folderId = attachments[0].drive_folder_id;
  const folderName = attachments[0].drive_folder_name;

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
        title="ดูเอกสารแนบ"
      >
        <FolderOpen size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เอกสารแนบ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600 font-medium truncate">{description}</p>

            <a
              href={`https://drive.google.com/drive/folders/${folderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              <FolderOpen size={13} />
              <span className="truncate">{folderName}</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>

            <div className="border-t border-slate-100 pt-3 space-y-1">
              {attachments.map((att) => (
                <a
                  key={att.id}
                  href={`https://drive.google.com/file/d/${att.drive_file_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 group"
                >
                  <FileText size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate group-hover:text-blue-600 flex-1">
                    {att.file_name}
                  </span>
                  <ExternalLink size={11} className="text-slate-300 group-hover:text-blue-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
