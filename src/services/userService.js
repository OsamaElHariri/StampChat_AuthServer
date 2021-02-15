var jwt = require('jsonwebtoken');
var userQueries = require('../server/db/queries/users');
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

    async login(firebaseAdmin, loginRequest) {
        let user = null;
        let verification = await firebaseAdmin
            .auth()
            .verifyIdToken(loginRequest.token);

        user = await userQueries.getUserByUid(verification.sub);
        if (!user) {
            user = await this.createUserFromVerification(verification);
        }

        user.token = this.generateUserToken(user);
        delete user.uid;
        return user;
    }

    async refresh(token) {
        // no need to verify since this function is behind an auth middleware
        const payload = jwt.decode(token);
        const user = await userQueries.getUser(payload.sub);
        return this.generateUserToken(user);
    }

    generateUserToken(user) {
        user.identity = this.getUserIdentity(user);

        const token = jwt.sign(user, this.getTokenSecret(), {
            subject: `${user.id}`,
            expiresIn: '1h',
        });

        return token;
    }

    async createUserFromVerification(verification) {
        this.addChatUser({
            uid: verification.sub,
            ...verification
        });
        let [user] = await userQueries.addUser({
            uid: verification.sub,
            name: verification.name,
            email: verification.email,
            picture: verification.picture,
        });


        return user;
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
        return `${name}_${user.uid}`;
    }
}

module.exports = UserService;