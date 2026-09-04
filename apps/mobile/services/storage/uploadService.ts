import { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/lib/apiClient';

export interface UploadLogoResponse {
  success: boolean;
  logoUrl: string;
  message: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  avatarUrl: string;
  message: string;
}

/**
 * Upload business store logo using the shared apiClient (Axios).
 * Automatically resolves and attaches JWT token and preserves FormData boundaries.
 */
export async function uploadStoreLogo(
  imageUri: string,
  token?: string,
): Promise<UploadLogoResponse> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'store_logo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : 'jpeg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('logo', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const config: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json',
    },
    timeout: 20000,
    transformRequest: (data) => data,
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const { data } = await apiClient.post<UploadLogoResponse>('/business/logo', formData, config);
  return data;
}

/**
 * Upload personal user avatar using the shared apiClient (Axios).
 * Automatically resolves and attaches JWT token and preserves FormData boundaries.
 */
export async function uploadUserAvatar(
  imageUri: string,
  token?: string,
): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : 'jpeg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const config: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json',
    },
    timeout: 20000,
    transformRequest: (data) => data,
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const { data } = await apiClient.post<UploadAvatarResponse>('/users/avatar', formData, config);
  return data;
}
