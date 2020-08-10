import {
  GOOGLE_MAPS_API_KEY,
  FIREBASE_REGION,
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_NAME,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  SEGMENT_ANDROID_KEY,
  SEGMENT_IOS_KEY,
  SENTRY_DSN,
  SENTRY_AUTH_TOKEN,
} from 'react-native-dotenv';

const createFirebaseConfig = () => {
  return {
    apiKey: FIREBASE_API_KEY,
    authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${FIREBASE_DATABASE_NAME}.firebaseio.com`,
    functionsURL: `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    emulator: {
      enabled: process.env.FIREBASE_EMULATOR === 'true',
      databaseURL: `localhost:8080`,
      functionsURL: `http://localhost:5001`,
    },
    // measurementId: null,
  };
};

export default ({ config }) => {
  const { slug, ios, android } = config;
  const flavor = process.env.FLAVOR;
  const googleMapsApiKey = GOOGLE_MAPS_API_KEY;
  const name = (flavor === 'consumer' && 'Cliente') || (flavor === 'courier' && 'Entregador');
  const bundleIdentifier = `${ios.bundleIdentifier}.${flavor}`;
  const androidPackage = `${android.package}.${flavor}`;
  const analytics = {
    segmentAndroidKey: SEGMENT_ANDROID_KEY,
    segmentiOSKey: SEGMENT_IOS_KEY,
    sentryDNS: SENTRY_DSN,
  };

  return {
    ...config,
    slug: `${slug}-${flavor}`,
    name,
    ios: {
      ...ios,
      bundleIdentifier,
      config: {
        googleMapsApiKey,
      },
    },
    android: {
      ...android,
      package: androidPackage,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    hooks: {
      ...config.hooks,
      postPublish: config.hooks.postPublish.map(({ file, config }) => ({
        file,
        config: { ...config, authToken: SENTRY_AUTH_TOKEN },
      })),
    },
    extra: {
      flavor,
      bundleIdentifier,
      androidPackage,
      googleMapsApiKey,
      firebase: createFirebaseConfig(),
      analytics,
    },
  };
};
