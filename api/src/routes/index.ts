import Router from "@koa/router";
import { v1Router } from './v1'
import { router } from './routes'

const routes = new Router();
routes.use(v1Router.routes(), v1Router.allowedMethods());
routes.use(router.routes(), router.allowedMethods());


export default routes;