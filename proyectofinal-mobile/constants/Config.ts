// Config.ts - Re-exporta las variables de env.ts para compatibilidad
import { API_URL, GOOGLE_CLIENT_ID, ENVIRONMENT } from './env';

const Config = {
  API_URL,
  GOOGLE_CLIENT_ID,
  ENVIRONMENT,
};

export default Config;