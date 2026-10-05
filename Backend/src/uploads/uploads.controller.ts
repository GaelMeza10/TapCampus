import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { IMAGE_MIME, MAX_IMAGE_BYTES } from './uploads.config';
import { publicOrigin } from './public-origin';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0 },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: IMAGE_MIME,
            overrideMimeType: true,
            errorMessage: 'Usa una imagen JPEG, PNG o WebP válida',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.uploads.save(file, publicOrigin(request));
  }
}
