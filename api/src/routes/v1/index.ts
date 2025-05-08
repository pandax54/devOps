import Router from "@koa/router";
import usersRouter from './users-routes';
import authRoutes from "./auth-routes";

const v1Router = new Router();

v1Router.use(usersRouter.routes(), usersRouter.allowedMethods());
v1Router.use(authRoutes.routes(), authRoutes.allowedMethods());

export { v1Router };