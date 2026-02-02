// Cognito Configuration (same as dashboard)
export const COGNITO_CLIENT_ID = '1ku1pkmllbrv2krfhect5faap5';
export const COGNITO_DOMAIN = 'seenn-dashboard.auth.eu-west-1.amazoncognito.com';
export const COGNITO_REGION = 'eu-west-1';

// OAuth URLs
export const AUTH_URL = `https://${COGNITO_DOMAIN}/oauth2/authorize`;
export const TOKEN_URL = `https://${COGNITO_DOMAIN}/oauth2/token`;
export const LOGOUT_URL = `https://${COGNITO_DOMAIN}/logout`;

// CLI OAuth callback
export const CALLBACK_PORT = 9876;
export const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

// Seenn API
export const API_BASE_URL = 'https://1k8zurpyzl.execute-api.eu-west-1.amazonaws.com/v1';

// Docs
export const DOCS_URL = 'https://docs.seenn.io';
export const QUICKSTART_URL = 'https://docs.seenn.io/quickstart';
