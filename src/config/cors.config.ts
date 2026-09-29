import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

import { WHITELIST_DOMAINS } from '@/common/constants'


export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Postman, server-to-server...
    if (!origin) {
      return callback(null, true)
    }

    // Development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }

    // Production
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(
      new Error( `${origin} not allowed by CORS policy`),
      false
    )
  },

  credentials: true,

  optionsSuccessStatus: 200
}