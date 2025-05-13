import authService from '@app/services/auth'

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (refreshToken) {
    // await authService.logout(refreshToken)
  }

  res.clearCookie('refreshToken')
  res.json({ success: true })
}
