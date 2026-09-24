import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { appConfig } from './config';

export type UploadResult = {
  url: string;
  storageKey: string;
  provider: 'cloudinary' | 'supabase' | 'local';
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger('Storage');

  /**
   * Check which cloud provider is active.
   */
  get provider(): 'cloudinary' | 'supabase' | 'local' {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      return 'cloudinary';
    }
    if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)) {
      return 'supabase';
    }
    return 'local';
  }

  /**
   * Upload an image (product, banner, or proof) to the active storage provider.
   */
  async upload(file: Express.Multer.File, folder: 'products' | 'proofs' = 'products'): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Archivo no válido.');
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';

    // 1. Cloudinary Provider

    if (this.provider === 'cloudinary') {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
        const apiKey = process.env.CLOUDINARY_API_KEY!;
        const apiSecret = process.env.CLOUDINARY_API_SECRET!;
        const timestamp = Math.floor(Date.now() / 1000);
        const cloudinaryFolder = `luxe_woman/${folder}`;

        // Generate SHA1 signature
        const toSign = `folder=${cloudinaryFolder}&timestamp=${timestamp}${apiSecret}`;
        const signature = createHash('sha1').update(toSign).digest('hex');

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
        formData.append('file', blob, file.originalname);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', cloudinaryFolder);
        formData.append('signature', signature);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errorText = await res.text();
          this.logger.error(`Cloudinary error: ${errorText}`);
          throw new Error('Error al subir imagen a Cloudinary.');
        }

        const data = await res.json() as { secure_url: string; public_id: string };
        return {
          url: data.secure_url,
          storageKey: data.public_id,
          provider: 'cloudinary'
        };
      } catch (err) {
        this.logger.error('Fallo en Cloudinary, cayendo a almacenamiento local...', err);
      }
    }

    // 2. Supabase Storage Provider
    if (this.provider === 'supabase') {
      try {
        const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/$/, '');
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'luxe-media';
        const objectPath = `${folder}/${randomUUID()}${ext}`;

        const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': file.mimetype,
            'x-upsert': 'true'
          },
          body: new Uint8Array(file.buffer)
        });

        if (!res.ok) {
          const errorText = await res.text();
          this.logger.error(`Supabase Storage error: ${errorText}`);
          throw new Error('Error al subir imagen a Supabase Storage.');
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
        return {
          url: publicUrl,
          storageKey: objectPath,
          provider: 'supabase'
        };
      } catch (err) {
        this.logger.error('Fallo en Supabase Storage, cayendo a almacenamiento local...', err);
      }
    }

    // 3. Local Storage Fallback
    const localDir = path.join(appConfig.storage, folder);
    await mkdir(localDir, { recursive: true });
    const localFileName = `${randomUUID()}${ext}`;
    const localFilePath = path.join(localDir, localFileName);
    await writeFile(localFilePath, file.buffer, { mode: 0o600, flag: 'wx' });

    // In local dev, public images can be accessed through api proxy or static route
    const localUrl = `/images/${folder}/${localFileName}`;
    return {
      url: localUrl,
      storageKey: localFileName,
      provider: 'local'
    };
  }
}
