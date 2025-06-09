export type Files = {
  files: FileList[];
};

export type FileList = {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
  uploadTime: string;
};
