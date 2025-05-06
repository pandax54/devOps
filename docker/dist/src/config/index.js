"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv");
const environment = process.env.NODE_ENV || "development";
exports.config = {
    environment: environment,
    database: {
        ssl: process.env.NODE_ENV === 'production' ? true : false,
        databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/database',
    },
};
//# sourceMappingURL=index.js.map