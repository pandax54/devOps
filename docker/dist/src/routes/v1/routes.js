"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const publicRoutes = new router_1.default({
    prefix: '/api/v1'
});
publicRoutes.get('/', (ctx, next) => {
    ctx.status = 200;
    ctx.body = {
        message: 'Hello World'
    };
});
exports.default = publicRoutes;
//# sourceMappingURL=routes.js.map