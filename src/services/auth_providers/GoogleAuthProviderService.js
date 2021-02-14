const { default: axios } = require("axios");

class GoogleAuthProviderService {
    verify(token) {
        return axios.get("https://oauth2.googleapis.com/tokeninfo?id_token=" + token).then(res => {
            if (res.error) throw "Invalid token";
            return res.data;
        });
    }

}

module.exports = GoogleAuthProviderService;