var jwt = require('jsonwebtoken');
var googleUserQueries = require('../server/db/queries/google_users');
var GoogleAuthProviderService = require('./auth_providers/GoogleAuthProviderService')
const { default: axios } = require("axios");

class UserService {
    getTokenSecret() {
        return "super_secret_key!";
    }

    async testChatServer() {
        try {
            const res = await axios.get(`http://${process.env.STAMP_CHAT_CHANNELS_SERVICE_HOST}:${process.env.STAMP_CHAT_CHANNELS_SERVICE_PORT}` + "/test");
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    async login(loginRequest) {
        let user = null;
        if (loginRequest.authProvider == 'google') {
            let verification;
            verification = await new GoogleAuthProviderService().verify(loginRequest.token);
            const googleUser = await googleUserQueries.getGoogleUserBySubject(verification.sub);
            if (!googleUser) {
                user = await this.createUserFromGoogleAuth(verification);
            } else {
                user = googleUser;
            }
        } else {
            throw "Auth provider not supported";
        }

        user.token = this.generateUserToken(user);
        delete user.subject;
        return user;
    }

    async refresh(token) {
        // no need to verify since this function is behind an auth middleware
        const payload = jwt.decode(token);
        const googleUser = await googleUserQueries.getGoogleUser(payload.sub);
        return this.generateUserToken(googleUser);
    }

    generateUserToken(user) {
        user.identity = this.getUserIdentity(user);

        const token = jwt.sign(user, this.getTokenSecret(), {
            subject: `${user.id}`,
            expiresIn: '1h',
        });

        return token;
    }

    async createUserFromGoogleAuth(googleAuth) {
        this.addChatUser({
            subject: googleAuth.sub,
            ...googleAuth
        });
        let [googleUser] = await googleUserQueries.addGoogleUser({
            subject: googleAuth.sub,
            name: googleAuth.name,
            email: googleAuth.email,
            picture: googleAuth.picture,
        });


        return googleUser;
    }

    async verify(token) {
        return GoogleAuthProviderService.verify(token);
    }

    async addChatUser(user) {
        try {
            const res = await axios.post(`http://${process.env.STAMP_CHAT_CHANNELS_SERVICE_HOST}:${process.env.STAMP_CHAT_CHANNELS_SERVICE_PORT}` + "/users", {
                name: user.name,
                identity: this.getUserIdentity(user)
            });

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    getUserIdentity(user) {
        const name = user.name.toLocaleLowerCase().replace(/\W/g, '').replace(/\s/, '_');
        return `${name}_${user.subject}`;
    }
}

module.exports = UserService;