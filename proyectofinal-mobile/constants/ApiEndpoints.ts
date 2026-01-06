const ApiEndpoints = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    UPDATE: "/api/auth/update",
    VERIFY: "/api/auth/verify",
  },

  AUDIO: {
    ANALYZE: "/api/audio/analyze",
    UPLOAD: "/api/audios/upload",
  },

  ANALISIS: {
    HISTORY: "/api/analisis/history",      // ✅ CORREGIDO
    DETAIL: "/api/analisis",               // ✅ CORREGIDO (sin /detail)
  },

  USERS: {
    PROFILE: "/api/auth/verify",
    STATISTICS: "/api/usuarios/statistics",
  },

  RECOMMENDATIONS: {
    LIST: "/api/recomendaciones",
    APPLY: "/api/recomendaciones/:id/aplicar",
    UTIL: "/api/recomendaciones/:id/util",
  },

  HEALTH: "/api/health",
};

export default ApiEndpoints;