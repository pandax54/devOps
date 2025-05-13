/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from 'koa'
import User from '../src/database/models/User'
// import { User } from '@app/database'

declare global {
  type JWTPayload = {
    email: string
    userId: string
    role: string
  }

  type AppContext<B = any, Q = any, P = any> = Context & {
    user?: User
    valid: {
      body: B
      query: Q
      params: P
    }
  }

  type BackgroundTask<P = any, R = any> = {
    execute(params: P): Promise<R>
    run(params: P): Promise<R>
  }

  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>
  }
}
