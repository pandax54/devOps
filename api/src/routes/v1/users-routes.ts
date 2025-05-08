import { logger } from "@app/utils/logger";
import Router from "@koa/router";

const usersRoutes = new Router({
  prefix: "/api/v1",
});

usersRoutes.get("/users", (ctx, next) => {


  ctx.status = 200;
  ctx.body = {
    message: "Hello World",
  };
});





export default usersRoutes;
