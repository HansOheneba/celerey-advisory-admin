"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteDocumentAction,
  uploadDocumentAction,
} from "@/app/actions/documents";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type ClientDocument,
  type DocumentCategory,
} from "@/lib/documents/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.docx";
const MAX_BYTES = 15 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ClientDocumentsCardProps = {
  clientId: string;
  initialDocuments: ClientDocument[];
  canEdit: boolean;
};

export function ClientDocumentsCard({
  clientId,
  initialDocuments,
  canEdit,
}: ClientDocumentsCardProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    if (next && !title) {
      setTitle(next.name.replace(/\.[^.]+$/, ""));
    }
  }

  function resetForm() {
    setTitle("");
    setCategory("other");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds the 15MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("category", category);
    if (title.trim()) {
      formData.append("title", title.trim());
    }

    startTransition(async () => {
      const result = await uploadDocumentAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setDocuments((current) => [result.document, ...current]);
      setOpen(false);
      resetForm();
      toast.success("Document uploaded");
    });
  }

  function handleDelete(documentId: string) {
    startTransition(async () => {
      const result = await deleteDocumentAction({ documentId, clientId });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setDocuments((current) =>
        current.filter((item) => item.id !== documentId),
      );
      toast.success("Document deleted");
    });
  }

  return (
    <Card className={dashboardTheme.card}>
      <CardHeader>
        <div>
          <p className={dashboardTheme.sectionLabel}>Files</p>
          <CardTitle className="text-base font-semibold">Documents</CardTitle>
        </div>
        {canEdit ? (
          <CardAction>
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) {
                resetForm();
              }
            }}
          >
            <DialogTrigger render={<Button type="button" size="sm" />}>
              <Plus />
              Upload
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload document</DialogTitle>
                <DialogDescription>
                  PDF, JPEG, PNG, WebP, or DOCX. 15MB max.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentFile">File</Label>
                  <Input
                    ref={fileInputRef}
                    id="documentFile"
                    type="file"
                    accept={ACCEPT}
                    required
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentTitle">Title</Label>
                  <Input
                    id="documentTitle"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Financial plan 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentCategory">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory((value as DocumentCategory) ?? "other")
                    }
                  >
                    <SelectTrigger id="documentCategory" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {DOCUMENT_CATEGORY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!file || pending}>
                    {pending ? "Uploading…" : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className={documents.length > 0 ? "divide-y divide-border/50 p-0" : undefined}>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files on this client yet.
          </p>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{document.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {DOCUMENT_CATEGORY_LABELS[document.category]} ·{" "}
                  {document.uploadedBy === "client" ? "Client" : "You"} ·{" "}
                  {formatBytes(document.sizeBytes)} ·{" "}
                  {formatDate(document.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {document.downloadUrl ? (
                  <a
                    href={document.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Download ${document.title}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                  >
                    <Download />
                  </a>
                ) : null}
                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${document.title}`}
                    disabled={pending}
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
