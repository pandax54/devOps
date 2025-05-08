import { logger } from "@app/utils/logger";
import Router from "@koa/router";

const authRoutes = new Router({
  prefix: "/api/v1",
});

authRoutes.post("/signup", (ctx, next) => {

  ctx.status = 200;
  ctx.body = {
    message: "Hello World",
  };
});

authRoutes.post("/login", (ctx, next) => {

  ctx.status = 200;
  ctx.body = {
    message: "Hello World",
  };
});

authRoutes.post("/logout", (ctx, next) => {

  ctx.status = 200;
  ctx.body = {
    message: "Hello World",
  };
});




export default authRoutes;
