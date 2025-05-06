import Router from '@koa/router'

const publicRoutes = new Router({
  prefix: '/api/v1'
})

publicRoutes.get('/', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    message: 'Hello World'
  }
})


export default publicRoutes