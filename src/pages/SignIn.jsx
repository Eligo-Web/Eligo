import { server } from "../ServerUrl";
import axios from "axios";

function SignIn() {
    async function assert() {
        await axios.post(`${server}/instructor/assert`, {
            SAMLResponse: new URLSearchParams(window.location.search).get(
                "SAMLResponse"
            ),
        });
    }
    assert();
    return;
}

export default SignIn;