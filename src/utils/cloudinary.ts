// utils/cloudinary.ts
interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
  }
  
  interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }
  
  export async function uploadImageToCloudinary(
    filePath: string, 
    config: CloudinaryConfig
  ): Promise<CloudinaryResponse> {
    try {
      console.log('Uploading to Cloudinary from:', filePath);
      
      const formData = new FormData();
      
      // Add the image file
      formData.append('file', {
        uri: filePath,
        type: 'image/jpeg',
        name: `nutriscan_${Date.now()}.jpg`,
      } as any);

      formData.append('upload_preset', config.uploadPreset);
  
      const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
  
      console.log('Uploading to:', uploadUrl);
  
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      console.log('Cloudinary upload successful:', data.secure_url);
      
      return data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }