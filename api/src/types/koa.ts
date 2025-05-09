import User from '@app/database/models/User';
import { Context } from 'koa';

export interface CustomState {
  user?: User
}

export interface CustomContext extends Context {
  state: CustomState;
  // Add any other custom properties
  log: any; // Logger is required by Context interface
  validate?: (schema: any, data: any) => any; // If you have a validation helper
}