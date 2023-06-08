import saml2 from "saml2-js";
import fs from "fs";

const sp_options = {
  entity_id: "localhost:5173", // identifier of the SP
  private_key: fs.readFileSync("./src/data/key-file.pem").toString(), // private key
  certificate: fs.readFileSync("./src/data/cert-file.crt").toString(), // public key
  assert_endpoint: "localhost:3000/assert", //assertion consumer url
};

const idp_options = {
  sso_login_url: "https://idp.jh.edu/idp/profile/SAML2/Redirect/SSO", // login endpoint
  sso_logout_url: "https://login.johnshopkins.edu/cgi-bin/logoff.pl", // logout endpoint
  certificates: [fs.readFileSync("./src/data/idp-cert-file.crt").toString()], // public key
};

export const sp = new saml2.ServiceProvider(sp_options);
export const idp = new saml2.IdentityProvider(idp_options);
