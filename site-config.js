/**
 * Axol Assist site URLs + Firebase (axol-work project) for public submissions.
 * Firebase web keys are public by design; security is in Firestore rules.
 */
window.AXOL_SITE = Object.freeze({
  origin: 'https://axolassist.com',
  chromeWebStoreUrl:
    'https://chromewebstore.google.com/detail/accessibility-surfer/pccmbliammnfaklpblehkonmhcdnedhn',
  firebase: Object.freeze({
    apiKey: 'AIzaSyAjFdbLIx-NSthVFPhK1ddIPs25H2MjHWM',
    authDomain: 'axol-work.firebaseapp.com',
    projectId: 'axol-work',
    storageBucket: 'axol-work.firebasestorage.app',
    messagingSenderId: '946319229886',
    appId: '1:946319229886:web:25d4f29329ac3720712fef',
  }),
});
