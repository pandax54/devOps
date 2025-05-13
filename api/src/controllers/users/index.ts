import { userRepository } from '@app/database/repositories/userRepository'
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
    const { email } = ctx.query
    console.log('Get user by email:', email)
    const user = await userRepository.findByEmail(email)
    const actives = await userRepository.findActiveUsers()
    console.log('User found:', user)
    console.log('actives found:', actives)

    ctx.body = {
      message: 'Get user',
      user: user,
    }
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
