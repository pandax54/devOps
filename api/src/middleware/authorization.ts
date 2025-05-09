

export const authorization = async (ctx: any, next: any) => {
  console.log('Authorization middleware triggered');

  // TODO: IMPLEMENT JWT token verification logic

  await next();
}