// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'loy8szo6e0'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-95g6r99e.auth0.com',            // Auth0 domain
  clientId: 'u4yMhiY1Cgv30AHaj43RccxddmEADo9c',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
