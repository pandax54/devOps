import { CustomContext } from '@app/types/koa'

class UserController {
  constructor() {
    // Initialize any properties or dependencies here
    // this.userService = userService;
  }

  async listUsers(ctx: CustomContext): Promise<void> {
    // Logic to get a user
    console.log('List users')

    // const users = await this.userService.findAll({ page, limit, ...filters });
    ctx.body = { message: 'List users' }
  }

  async getUser(ctx) {
    // Logic to get a user
    ctx.body = { message: 'Get user' }
  }

  async createUser(ctx) {
    // Logic to create a user
    ctx.body = { message: 'Create user' }
  }

  async updateUser(ctx) {
    // Logic to update a user
    ctx.body = { message: 'Update user' }
  }

  async deleteUser(ctx) {
    // Logic to delete a user
    ctx.body = { message: 'Delete user' }
  }
}

const userController = new UserController()
export default userController
