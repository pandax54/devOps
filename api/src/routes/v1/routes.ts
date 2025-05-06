import { logger } from "@app/utils/logger";
import Router from "@koa/router";

const publicRoutes = new Router({
  prefix: "/api/v1",
});

publicRoutes.get("/", (ctx, next) => {
  
  // With context
  logger.info({ userId: "123" }, "User logged in");

  const routeLogger = logger.child({ component: "routes" });
  routeLogger.info("Route handler called");

  // Different levels
  // logger.error({ err }, "Error processing request");
  // logger.trace("Detailed debugging");
  // logger.debug("Debugging information");
  // logger.info("Informational message");
  // logger.warn("Warning message");
  // logger.error("Error message");
  // logger.fatal("Critical error");

  ctx.status = 200;
  ctx.body = {
    message: "Hello World",
  };
});



export default publicRoutes;
