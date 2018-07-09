const admin = require('firebase-admin');
const faker = require('faker');
const packages =  require('./packages');

var serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY) || require('../xalgo-authoring-ui-4c337bb3b154.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

function fetchState(id) {
  return db.collection('states').doc(id).get();
}

async function storeState(id, state) {
  const {doc: {content}} = state;

  for (let c of content) {
    if (c.type === 'code_block') {
      const randomName = faker.system.commonFileName();
      c.github_name = c.github_name || `${randomName}.rule`;

      await packages.createNewFileOrUpdate(id, `${id}/${c.github_name}.rule`, c.content[0].text)
    }
  }

  return await db.collection('states').doc(id).set(state);
}

module.exports = {
  fetchState,
  storeState,
};