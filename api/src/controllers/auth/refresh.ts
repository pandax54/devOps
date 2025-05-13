import authService from '@app/services/auth'

export const refresh = async (req, res) => {
  try {
    // Get refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const authResult = await authService.refresh(refreshToken, user)

    res.json({
      accessToken: authResult.accessToken,
      expiresIn: authResult.expiresIn,
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}
