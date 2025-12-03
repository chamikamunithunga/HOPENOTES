/**
 * Cloudinary File Upload Utility
 * 
 * This utility handles file uploads to Cloudinary.
 * Make sure to set up your Cloudinary credentials in .env file:
 * - VITE_CLOUDINARY_CLOUD_NAME
 * - VITE_CLOUDINARY_UPLOAD_PRESET
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<Object>} - Object containing the uploaded file URL and metadata
 */
export async function uploadFileToCloudinary(file, onProgress = null) {
  // Debug: Log environment variables (remove in production)
  console.log('Cloudinary Config:', {
    cloudName: CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    uploadPreset: CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Missing',
    uploadUrl: CLOUDINARY_UPLOAD_URL
  });

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    const errorMsg = `Cloudinary credentials not configured. 
      Cloud Name: ${CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing'}
      Upload Preset: ${CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Missing'}
      Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (10MB limit for free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit. Please upload a smaller file.');
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG'
    );
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'hopenotes/files'); // Organize files in a folder
  formData.append('resource_type', 'auto'); // Let Cloudinary detect the type

  try {
    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              format: response.format,
              bytes: response.bytes,
              width: response.width,
              height: response.height,
              resourceType: response.resource_type,
              createdAt: response.created_at
            });
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            console.error('Upload error response:', error);
            reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`));
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Start upload
      xhr.open('POST', CLOUDINARY_UPLOAD_URL);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  // Check file size (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please upload a smaller file.'
    };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG'
    };
  }

  return { valid: true, error: null };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

