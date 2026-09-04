import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  /**
   * Centralized upload method for buffers
   * @param file Express.Multer.File
   * @param folder Destination folder on Cloudinary
   * @param transformation Optional Cloudinary transformation array
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    transformation: any[] = [
      { width: 600, height: 600, crop: 'limit', quality: 'auto' },
    ],
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Valid image file is required');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            transformation,
            resource_type: 'auto',
            timeout: 30000,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result!);
            }
          },
        )
        .end(file.buffer);
    });
  }
}
