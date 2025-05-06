import { Model } from 'objection';
export default class User extends Model {
    id: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    $beforeInsert(): void;
    $beforeUpdate(): void;
    static get jsonSchema(): {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            created_at: {
                type: string;
                format: string;
            };
            updated_at: {
                type: string;
                format: string;
            };
        };
    };
}
