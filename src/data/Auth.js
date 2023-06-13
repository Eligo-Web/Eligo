import fs from "fs";
import saml2 from "saml2-js";

const sp_options = {
  entity_id: "https://eligo.cs.jhu.edu", // identifier of the SP
  private_key: fs
    .readFileSync("/home/amir/Eligo/src/data/key-file.pem")
    .toString(), // private key
  certificate: fs
    .readFileSync("/home/amir/Eligo/src/data/cert-file.crt")
    .toString(), // public key
  assert_endpoint: "https://eligo.cs.jhu.edu/api/signin", //assertion consumer url
  allow_unencrypted_assertion: true,
};

const idp_options = {
  sso_login_url: "https://idp.jh.edu/idp/profile/SAML2/Redirect/SSO", // login endpoint
  sso_logout_url: "https://login.johnshopkins.edu/cgi-bin/logoff.pl", // logout endpoint
  certificates: [
    fs.readFileSync("/home/amir/Eligo/src/data/idp-cert-file1.crt").toString(),
    fs.readFileSync("/home/amir/Eligo/src/data/idp-cert-file2.crt").toString(),
  ], // public key
};

export const sp = new saml2.ServiceProvider(sp_options);
export const idp = new saml2.IdentityProvider(idp_options);
