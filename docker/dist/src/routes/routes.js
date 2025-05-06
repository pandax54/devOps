"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const routes = new router_1.default();
routes.get('/health', (ctx, next) => {
    ctx.status = 200;
    ctx.body = {
        server: true,
        timestamp: new Date().toISOString()
    };
});
exports.default = routes;
//# sourceMappingURL=routes.js.map