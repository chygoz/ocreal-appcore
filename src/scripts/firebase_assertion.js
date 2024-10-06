const jwt = require('jsonwebtoken');
const fs = require('fs');
const serviceAccount = require('../../ocreal_firebase_config.json');

// Define payload for the JWT
const payload = {
  iss: serviceAccount.client_email,
  scope: 'https://www.googleapis.com/auth/firebase.messaging',
  aud: 'https://oauth2.googleapis.com/token',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
};

// Sign the JWT with the private key from the service account
const token = jwt.sign(payload, serviceAccount.private_key, {
  algorithm: 'RS256',
  header: {
    alg: 'RS256',
    typ: 'JWT',
  },
});

console.log('Generated JWT:', token);
