import ky from 'ky';

const createClient = (baseUrl: string) => ky.create({
  prefix: baseUrl,
  timeout: 15000,
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [
      (error: any) => {
        const { response } = error;
        if (response) {
          console.error(`[API Error] ${response.status} - ${response.url}`);
        }
        return error;
      },
    ],
  },
} as any);

console.log('[API Client] OPhim URL:', import.meta.env.VITE_OPHIM_API_URL);
console.log('[API Client] KKPhim URL:', import.meta.env.VITE_KKPHIM_API_URL);

export const ophimClient = createClient(import.meta.env.VITE_OPHIM_API_URL);
export const kkphimClient = createClient(import.meta.env.VITE_KKPHIM_API_URL);

// Legacy export for backward compatibility
export const apiClient = ophimClient;
