const convict = require('convict');
const { tmpdir } = require('os');
const path = require('path');
const { randomBytes } = require('crypto');

const conf = convict({
  LOGIN_URL: {
    format: String,
    default: 'http://localhost:1443',
    env: 'LOGIN_URL'
  },
  SEND_FRONTEND_REDIRECT_KEY: {
    format: String,
    default: 'send',
    env: 'SEND_FRONTEND_REDIRECT_KEY'
  },
  s3_bucket: {
    format: String,
    default: 'secret-storage-test.vault.gov.sg',
    env: 'S3_BUCKET'
  },
  gcs_bucket: {
    format: String,
    default: '',
    env: 'GCS_BUCKET'
  },
  expire_times_seconds: {
    format: Array,
    default: [300, 3600, 86400, 604800],
    env: 'EXPIRE_TIMES_SECONDS'
  },
  default_expire_seconds: {
    format: Number,
    default: 86400,
    env: 'DEFAULT_EXPIRE_SECONDS'
  },
  max_expire_seconds: {
    format: Number,
    default: 86400 * 7,
    env: 'MAX_EXPIRE_SECONDS'
  },
  anon_max_expire_seconds: {
    format: Number,
    default: 86400 * 7,
    env: 'ANON_MAX_EXPIRE_SECONDS'
  },
  download_counts: {
    format: Array,
    default: [1, 2, 3, 4, 5, 20, 50, 100],
    env: 'DOWNLOAD_COUNTS'
  },
  max_downloads: {
    format: Number,
    default: 100,
    env: 'MAX_DOWNLOADS'
  },
  anon_max_downloads: {
    format: Number,
    default: 100,
    env: 'ANON_MAX_DOWNLOADS'
  },
  max_files_per_archive: {
    format: Number,
    default: 64,
    env: 'MAX_FILES_PER_ARCHIVE'
  },
  max_archives_per_user: {
    format: Number,
    default: 16,
    env: 'MAX_ARCHIVES_PER_USER'
  },
  allowed_file_types: {
    format: Array,
    default: [
      '.doc',
      '.docx',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.csv',
      '.xls',
      '.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ' application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      '.pptx',
      '.ppt',
      'audio/*',
      'video/*',
      'image/*',
      'application/pdf'
    ],
    env: 'ALLOWED_FILE_TYPES'
  },
  redis_host: {
    format: String,
    default: 'localhost',
    env: 'REDIS_HOST'
  },
  redis_event_expire: {
    format: Boolean,
    default: false,
    env: 'REDIS_EVENT_EXPIRE'
  },
  listen_address: {
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'IP_ADDRESS'
  },
  listen_port: {
    format: 'port',
    default: 1443,
    arg: 'port',
    env: 'PORT'
  },
  logging_url: {
    format: String,
    default: 'http://localhost:4000/secret_datasets',
    env: 'LOGGING_URL'
  },
  analytics_id: {
    format: String,
    default: '',
    env: 'GOOGLE_ANALYTICS_ID'
  },
  sentry_id: {
    format: String,
    default: '',
    env: 'SENTRY_CLIENT'
  },
  sentry_dsn: {
    format: String,
    default: '',
    env: 'SENTRY_DSN'
  },
  env: {
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  max_file_size: {
    format: Number,
    default: 10 * 1024 * 1024 * 1024,
    env: 'MAX_FILE_SIZE'
  },
  anon_max_file_size: {
    format: Number,
    default: 10 * 1024 * 1024 * 1024,
    env: 'ANON_MAX_FILE_SIZE'
  },
  l10n_dev: {
    format: Boolean,
    default: false,
    env: 'L10N_DEV'
  },
  base_url: {
    format: 'url',
    default: 'https://send.firefox.com',
    env: 'BASE_URL'
  },
  file_dir: {
    format: 'String',
    default: `${tmpdir()}${path.sep}send-${randomBytes(4).toString('hex')}`,
    env: 'FILE_DIR'
  },
  fxa_url: {
    format: 'url',
    default: 'https://send-fxa.dev.lcip.org',
    env: 'FXA_URL'
  },
  fxa_client_id: {
    format: String,
    default: '', // disabled
    env: 'FXA_CLIENT_ID'
  },
  fxa_key_scope: {
    format: String,
    default: 'https://identity.mozilla.com/apps/send',
    env: 'FXA_KEY_SCOPE'
  },
  survey_url: {
    format: String,
    default: '',
    env: 'SURVEY_URL'
  },
  ip_db: {
    format: String,
    default: '',
    env: 'IP_DB'
  },
  cookie_secret: {
    format: String,
    default: '',
    env: 'COOKIE_SECRET'
  },
  cookie_domain: {
    format: String,
    default: '',
    env: 'COOKIE_DOMAIN'
  },
  redis_session_url: {
    format: String,
    default: '',
    env: 'REDIS_SESSION_URL'
  }
});

// Perform validation
conf.validate({ allowed: 'strict' });

const props = conf.getProperties();
module.exports = props;
