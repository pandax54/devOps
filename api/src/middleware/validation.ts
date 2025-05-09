import { Context, Next } from 'koa';
import Joi from 'joi';
import { logger } from '@app/utils/logger';

export interface ValidationOptions {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
}

export const validate = (options: ValidationOptions) => {
  return async (ctx: Context, next: Next) => {
    try {
      const errors: Record<string, any> = {};
      
      if (options.body && ctx.request.body) {
        const { error, value } = options.body.validate(ctx.request.body, { abortEarly: false });
        if (error) {
          errors.body = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
          }));
        } else {
          ctx.request.body = value;
        }
      }
      
      if (options.query && ctx.query) {
        const { error, value } = options.query.validate(ctx.query, { abortEarly: false });
        if (error) {
          errors.query = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
          }));
        } else {
          ctx.query = value;
        }
      }
      
      if (options.params && ctx.params) {
        const { error, value } = options.params.validate(ctx.params, { abortEarly: false });
        if (error) {
          errors.params = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
          }));
        } else {
          ctx.params = value;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        ctx.status = 400;
        ctx.body = { error: 'Validation Error', details: errors };
        return;
      }
      
      await next();
    } catch (error) {
      logger.error({ err: error }, 'Validation middleware error');
      ctx.status = 500;
      ctx.body = { error: 'Internal server error during validation' };
    }
  };
};