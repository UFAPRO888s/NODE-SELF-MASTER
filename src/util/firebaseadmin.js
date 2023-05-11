const admin = require("firebase-admin");

const serviceAccount = require("./service_account.json");
if (!admin.apps.length) {
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buudata-f65f7-default-rtdb.asia-southeast1.firebasedatabase.app"
});
}


module.exports = admin;