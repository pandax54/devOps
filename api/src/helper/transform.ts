import { camelCase, snakeCase } from 'lodash';

export const camelizeKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(camelizeKeys);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[camelCase(key)] = camelizeKeys(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null and undefined
    if (value === null || value === undefined) continue;
    
    // Convert key to snake_case
    result[snakeCase(key)] = value;
  }
  
  return result;
}