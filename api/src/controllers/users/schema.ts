import Joi from 'joi';

export const userSchemas = {
  create: Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    first_name: Joi.string().required(),
    last_name: Joi.string().allow('', null),
    is_active: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    first_name: Joi.string(),
    last_name: Joi.string().allow('', null),
    is_active: Joi.boolean()
  }),
  
  listUsers: Joi.object({
    // testing validation
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'user').optional(),
    // page: Joi.number().integer().min(1).default(1),
    // limit: Joi.number().integer().min(1).max(100).default(10),
    // search: Joi.string().allow('', null),
    // sort_by: Joi.string().valid('username', 'email', 'created_at').default('created_at'),
    // sort_order: Joi.string().valid('asc', 'desc').default('desc')
  })
};