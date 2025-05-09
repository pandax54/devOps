import userController from "@app/controllers/users";
import { userSchemas } from "@app/controllers/users/schema";
import { authorization } from "@app/middleware/authorization";
import { validate } from "@app/middleware/validation";
import Router from "@koa/router";

const usersRoutes = new Router({
  prefix: "/api/v1",
});

// ensure that the this context within the controller method remains correctly bound to the controller instance.

// + validation: body, query, params types for the route
usersRoutes.post("/users/:id", authorization, validate({ body: userSchemas.listUsers }), userController.listUsers.bind(userController));



export default usersRoutes;
