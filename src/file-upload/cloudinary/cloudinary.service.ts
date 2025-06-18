/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from "@nestjs/common";
import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import * as streamifier from "streamifier";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY")
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: "learn-nestjs",
          resource_type: "auto",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(
              new Error(`Upload failed: ${error.message || "Unknown error"}`),
            );
            return;
          }

          if (!result) {
            reject(new Error("Upload failed: No result returned"));
            return;
          }

          resolve(result);
        },
      );

      if (!file?.buffer) {
        throw new Error("File buffer is required");
      }

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
