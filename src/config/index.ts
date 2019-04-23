import * as convict from 'convict';

interface IConfig {
  env: string;
  version: string;
  tokenSecret: string;
  server: {
    port: number;
    frontendURL: string;
    passwordSalt: string;
    tokenExpiry: string;
    resetHashExpiry: number;
  };
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    url: string;
  };
  apiAccessKeys: {
    app: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  cloudinary: {
    name: string;
    apiKey: string;
    apiSecret: string;
    env: string;
  };
  sendgrid: {
    key: string;
  };
}

const config = convict<IConfig>({
  env: {
    format: ['production', 'staging', 'qa', 'development', 'local', 'test'],
    env: 'NODE_ENV',
    arg: 'node-env',
    default: 'local'
  },
  version: {
    format: String,
    env: 'GIT_COMMIT',
    default: 'unknown'
  },
  tokenSecret: {
    format: String,
    env: 'TOKEN_SECRET',
    default: ''
  },
  server: {
    port: {
      format: 'port',
      env: 'PORT',
      default: 3000
    },
    frontendURL: {
      format: String,
      env: 'FRONTEND_URL',
      default: 'http://localhost:4200'
    },
    passwordSalt: {
      format: String,
      env: 'HASH_SALT',
      default: ''
    },
    tokenExpiry: {
      format: String,
      env: 'TOKEN_EXPIRY',
      default: '1w'
    },
    resetHashExpiry: {
      format: Number,
      env: 'RESET_HASH_EXPIRY',
      default: 4
    }
  },
  postgres: {
    host: {
      format: String,
      env: 'DB_HOST',
      default: 'localhost'
    },
    port: {
      format: 'port',
      env: 'DB_PORT',
      default: 5432
    },
    username: {
      format: String,
      env: 'DB_USERNAME',
      default: 'postgres'
    },
    password: {
      format: String,
      env: 'DB_PASSWORD',
      default: 'postgres'
    },
    database: {
      format: String,
      env: 'DB_DATABASE',
      default: 'postgres'
    },
    url: {
      format: String,
      env: 'DB_URL',
      default: ''
    }
  },
  apiAccessKeys: {
    app: {
      format: String,
      env: 'API_ACCESS_KEY',
      default: '123456'
    }
  },
  email: {
    host: {
      format: String,
      env: 'SMTP_HOST',
      default: ''
    },
    port: {
      format: Number,
      env: 'SMTP_PORT',
      default: 465
    },
    secure: {
      format: Boolean,
      env: 'SMTP_SECURE',
      default: true
    },
    user: {
      format: String,
      env: 'SMTP_USER',
      default: ''
    },
    password: {
      format: String,
      env: 'SMTP_PASSWORD',
      default: ''
    }
  },
  cloudinary: {
    name: {
      format: String,
      env: 'CLOUDINARY_NAME',
      default: ''
    },
    apiKey: {
      format: String,
      env: 'CLOUDINARY_API_KEY',
      default: ''
    },
    apiSecret: {
      format: String,
      env: 'CLOUDINARY_API_SECRET',
      default: ''
    },
    env: {
      format: String,
      env: 'CLOUDINARY_ENV',
      default: ''
    }
  },
  sendgrid: {
    key: {
      format: String,
      env: 'SENDGRID_API_KEY',
      default: ''
    }
  }
});

config.validate({ allowed: 'strict' });

export default config.getProperties();
