import "dotenv";
type Config = {
    environment: string;
    database: {
        ssl: boolean;
        databaseUrl: string;
    };
};
export declare const config: Config;
export {};
