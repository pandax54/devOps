import authService from '@app/services/auth';

export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body
    const authResult = await authService.login(email, password)
    
    // Set refresh token as HttpOnly, Secure cookie
    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    })
    
    res.json({
      accessToken: authResult.accessToken,
      expiresIn: authResult.expiresIn,
    })
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
