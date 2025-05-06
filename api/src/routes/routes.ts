import Router from '@koa/router'

const routes = new Router()

routes.get('/health', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    server: true,
    timestamp: new Date().toISOString()
  }
})


export default routes