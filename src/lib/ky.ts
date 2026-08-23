import ky from 'ky';

import { API_URL } from '@/config';

export const apiClient = ky.create({
  baseUrl: API_URL.endsWith('/') ? API_URL : `${API_URL}/`,
  retry: 0,
  timeout: 10000,
});
