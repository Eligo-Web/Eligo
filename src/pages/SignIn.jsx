import { server } from "../ServerUrl";
import axios from "axios";

function SignIn() {
    async function assert() {
        await axios.post(`${server}/instructor/assert`);
    }
    assert();
    return;
}

export default SignIn;