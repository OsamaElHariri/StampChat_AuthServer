const Koa = require('koa');
const logger = require('koa-morgan')
const Router = require('koa-router');
const UserService = require('./services/userService');
const bodyParser = require('koa-body')();
var jwt = require('koa-jwt');
var admin = require("firebase-admin");

var serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
    serviceAccount = require("../service_account.json");
}

const app = new Koa();

const routes = new Router()
const publicRoutes = new Router()

publicRoutes.get('/test', ctx => {
    ctx.body = {
        status: 'auth ok'
    }
});

publicRoutes.get('/test-chat', async ctx => {
    ctx.body = await (new UserService()).testChatServer();
});

publicRoutes.post('/login', async ctx => {
    try {
        const user = await (new UserService()).login(ctx.firebaseAdmin, ctx.request.body);
        ctx.body = user;
    } catch (error) {
        ctx.throw(400, "Invalid login request")
    }
})

routes.post('/refresh', async ctx => {
    try {
        const token = ctx.get('Authorization').replace("Bearer ", "");
        ctx.body = {
            token: await (new UserService()).refresh(token)
        };
    } catch (error) {
        ctx.throw(400, "Error refreshing token")
    }
})
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app
    .use(async (ctx, next) => {
        ctx.firebaseAdmin = admin;
        await next();
    })
    .use(logger('tiny'))
    .use(bodyParser)
    .use(publicRoutes.routes())
    .use(jwt({ secret: (new UserService()).getTokenSecret() }))
    .use(routes.routes());

app.listen(process.env.PORT || 3000);