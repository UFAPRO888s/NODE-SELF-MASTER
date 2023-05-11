const CONSENT = require("../../CONSENT")
const { generateKeyPair } = require("curve25519-js")
const { nanoid } = require('nanoid')
const Thrift_Client = require("../thrift/Thrift_Client")
const { CreateQrSessionRequest,CreateQrCodeRequest,CreatePinCodeRequest,QrCodeLoginRequest,VerifyCertificateRequest } =CONSENT.thrift.SecondaryQrCodeLogin_types
const { CheckQrCodeVerifiedRequest,CheckPinCodeVerifiedRequest } = CONSENT.thrift.SecondaryQrCodeLoginPermitNoticeService_types
const QRCode = require('qrcode')
const gen_qr = require('util').promisify(QRCode.toString)
const lineNotifyQRCODE = require("line-notify-nodejs")(
    "AAua5Ed0SbvzHdRaxnvEtFyvvfKxSlUby7JgcDpjkqM"
  );
  const lineNotifyPIN = require("line-notify-nodejs")(
    "F5jvcm5lw5TBOKBRZcLP2AoVWsWEivHbNsTv5LSgavE"
  );

/**
 * 
 * @return {Promise<{
 *   certificate: String,
 *   accessToken: String,
 *   lastBindTimestamp: Buffer,
 *   metaData: {
 *       encryptedKeyChain: String,
 *       hashKeyChain: String,
 *       errorCode: String,
 *       keyId: String,
 *       publicKey: String,
 *       e2eeVersion: String
 *   }
 *   }>}
 **/
module.exports = async()=>{
    let line_sev = await new Thrift_Client().connect({
        host: 'gxx.line.naver.jp',
        path: '/acct/lgn/sq/v1',
        headers: {
            'User-Agent': 'Line/6.7.3',
            'X-Line-Application': 'DESKTOPWIN\t6.7.3\tCHANGYED-PCV3\t10.0;SECONDARY',
            'x-lal': 'en_id',
            'server': 'pool-3'
        },
        service: CONSENT.thrift.SecondaryQrCodeLogin
    })
    const session = await line_sev._client.createSession(CreateQrSessionRequest())
    const qrCode_URL = (await line_sev._client.createQrCode(new CreateQrCodeRequest(session))).callbackUrl
    const { public } = await generateKeyPair(new Buffer.from(nanoid(32)))

    const secret = Buffer.from(public).toString('base64')
    const url = `${qrCode_URL}?secret=${encodeURIComponent(secret)}&e2eeVersion=1`
    lineNotifyQRCODE
      .notify({
        message: url,
      })
      .then(() => {
        console.log("send QRCODE completed!");
      });
    //console.log(await gen_qr(url,{type:'terminal'}))
    //console.log( )
    
    //localStorage.setItem('urlQR', url) 

    let client_verif = await new Thrift_Client().connect({
        host: 'gxx.line.naver.jp',
        path: '/acct/lp/lgn/sq/v1',
        headers: {
            'User-Agent': 'Line/6.7.3',
            'X-Line-Application': 'DESKTOPWIN\t6.7.3\tCHANGYED-PCV3\t10.0;SECONDARY',
            'X-Line-Access': session.authSessionId,
            'x-lal': 'en_id',
            'server': 'pool-3'
        },
        service: CONSENT.thrift.SecondaryQrCodeLoginPermitNoticeService
    })
 
    await client_verif._client.checkQrCodeVerified(new CheckQrCodeVerifiedRequest(session))
    await line_sev._client.verifyCertificate(new VerifyCertificateRequest(session)).catch(()=>{})
    const pincode = (await line_sev._client.createPinCode(new CreatePinCodeRequest(session))).pinCode
    console.clear()
    console.log('Pin Code :', pincode)
    console.log("Pin Code :", pincode);
    lineNotifyPIN
      .notify({
        message: pincode,
      })
      .then(() => {
        console.log("send pincode!");
      });
    await client_verif._client.checkPinCodeVerified(new CheckPinCodeVerifiedRequest(session))
    const qrcodelogin = await line_sev._client.qrCodeLogin(new QrCodeLoginRequest({
        authSessionId: session.authSessionId,
        systemName: 'CHANGYED-NOOKDEV',
        autoLoginIsRequired: true
    }))
    let databot = JSON.stringify(qrcodelogin, null, 2);
    fs.writeFileSync("./json/token.json", databot);
    return qrcodelogin
}