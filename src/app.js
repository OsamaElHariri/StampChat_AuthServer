const Koa = require('koa');
const logger = require('koa-morgan')
const Router = require('koa-router');
const UserService = require('./services/userService');
const bodyParser = require('koa-body')();
var jwt = require('koa-jwt');

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
        const user = await (new UserService()).login(ctx.request.body);
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

app
    .use(logger('tiny'))
    .use(bodyParser)
    .use(publicRoutes.routes())
    .use(jwt({ secret: (new UserService()).getTokenSecret() }))
    .use(routes.routes());

app.listen(process.env.PORT || 3000);