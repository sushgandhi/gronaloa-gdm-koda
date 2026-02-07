
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['transform-inline-environment-variables', {
        include: [
          'API_KEY', 
          'CLOUD_RUN_URL',
          'FIREBASE_API_KEY', 
          'FIREBASE_AUTH_DOMAIN', 
          'FIREBASE_PROJECT_ID', 
          'FIREBASE_STORAGE_BUCKET', 
          'FIREBASE_MESSAGING_SENDER_ID', 
          'FIREBASE_APP_ID',
          'GOOGLE_WEB_CLIENT_ID'
        ]
      }]
    ]
  };
};
