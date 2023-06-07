import saml2 from 'saml2-js';

const sp_options = {
    entity_id: process.env.ENTITY_ID, // entity id
    private_key: process.env.PRIVATE_KEY, // private key
    certificate: process.env.SP_CERTIFICATE, // certificate
    assert_endpoint: process.env.ASSERT_ENDPOINT // assert endpoint
};

const idp_options = {
    sso_login_url: process.env.SSO_LOGIN_URL, // login url
    sso_logout_url: process.env.SSO_LOGOUT_URL, // logout url,
    certificates: process.env.IDP_CERTIFICATES //certificates,
};

export const sp = new saml2.ServiceProvider(sp_options);
export const idp = new saml2.IdentityProvider(idp_options);
