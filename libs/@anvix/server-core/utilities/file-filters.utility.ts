import { BadRequestException } from '@nestjs/common';

/**
 * File filter for image uploads
 * Only allows common image file types
 */
export const imageFileFilter = (req: any, file: any, callback: Function) => {
  // Check if file exists
  if (!file) {
    return callback(new BadRequestException('File is required'), false);
  }

  // Define allowed image MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif'
  ];

  // Define allowed file extensions as fallback
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

  // Check MIME type first
  if (allowedMimes.includes(file.mimetype)) {
    return callback(null, true);
  }

  // Check file extension as fallback
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (allowedExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  // File type not allowed
  return callback(
    new BadRequestException({
      message: 'ERR_INVALID_FILE_TYPE',
      details: `Only image files are allowed. Supported formats: ${allowedExtensions.join(', ')}`
    }),
    false
  );
};