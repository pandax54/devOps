import Router from '@koa/router'
import authController from '@app/controllers/auth'

const authRoutes = new Router({
  prefix: '/auth',
})

authRoutes.post('/signup', authController.signup)

authRoutes.post('/reset-password', authController.refreshToken)

authRoutes.post('/login',  authController.login)

authRoutes.post('/logout', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    message: 'Hello World',
  }
})

authRoutes.post('/refresh', authController.refresh)

export default authRoutes
