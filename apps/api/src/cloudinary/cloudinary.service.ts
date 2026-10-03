import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';

export interface UploadImageOptions {
  publicId?: string;
  overwrite?: boolean;
  transformation?: unknown[];
}

@Injectable()
export class CloudinaryService {
  /**
   * Centralized upload method for buffers with cache invalidation and overwrite support
   * @param file Express.Multer.File
   * @param folder Destination folder on Cloudinary
   * @param options UploadImageOptions (publicId, overwrite, transformation)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    options?: UploadImageOptions,
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Valid image file is required');
    }

    const transformation = options?.transformation ?? [
      { width: 600, height: 600, crop: 'limit', quality: 'auto' },
    ];

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: options?.publicId,
            overwrite: options?.overwrite ?? false,
            invalidate: options?.overwrite ? true : undefined,
            transformation,
            resource_type: 'image',
            timeout: 30000,
          },
          (error, result) => {
            if (error) {
              const message =
                typeof error === 'object' && error && 'message' in error
                  ? String((error as { message: unknown }).message)
                  : 'Cloudinary upload failed';
              reject(new Error(message));
            } else {
              resolve(result!);
            }
          },
        )
        .end(file.buffer);
    });
  }
}
