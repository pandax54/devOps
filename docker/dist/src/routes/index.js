"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.publicRoutes = void 0;
const routes_1 = __importDefault(require("./v1/routes"));
exports.publicRoutes = routes_1.default;
const routes_2 = __importDefault(require("./routes"));
exports.routes = routes_2.default;
//# sourceMappingURL=index.js.map