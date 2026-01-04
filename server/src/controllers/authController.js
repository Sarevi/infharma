import { User } from '../models/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, name, hospital, specialty } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email',
      });
    }

    // Check if email is configured - if not, skip verification
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Create user
    // If email not configured, auto-verify the user
    const user = await User.create({
      email,
      password,
      name,
      hospital,
      specialty,
      role: 'farmaceutico',
      emailVerified: !emailConfigured, // Auto-verify if no email config
      verificationToken: emailConfigured ? verificationToken : null,
      verificationTokenExpires: emailConfigured ? verificationTokenExpires : null,
    });

    // Only send verification email if email is configured
    if (emailConfigured) {
      const emailResult = await sendVerificationEmail(email, name, verificationToken);
      if (!emailResult.success) {
        console.error('Error sending verification email:', emailResult.error);
      }

      res.status(201).json({
        success: true,
        message: 'Usuario registrado. Por favor verifica tu email.',
        data: {
          email: user.email,
          name: user.name,
          emailSent: emailResult.success,
        },
      });
    } else {
      // No email configured - user is auto-verified
      console.log(`✅ Usuario ${email} registrado y verificado automáticamente (email no configurado)`);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente. Ya puedes iniciar sesión.',
        data: {
          email: user.email,
          name: user.name,
          autoVerified: true,
        },
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Por favor verifica tu email antes de iniciar sesión',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // Update last seen and status
    await user.update({
      lastSeen: new Date(),
      status: 'online',
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message,
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    await user.update({
      status: 'offline',
      lastSeen: new Date(),
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message,
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, hospital, specialty } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Update only provided fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (hospital !== undefined) updates.hospital = hospital;
    if (specialty !== undefined) updates.specialty = specialty;

    await user.update(updates);

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

// Verify email with token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación requerido',
      });
    }

    // Find user by verification token
    const user = await User.findOne({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Token de verificación inválido',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'El email ya ha sido verificado',
      });
    }

    // Check if token expired
    if (new Date() > user.verificationTokenExpires) {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación ha expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Verify email
    await user.update({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate tokens for auto-login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: '¡Email verificado exitosamente! Bienvenido a InFHarma',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email',
      error: error.message,
    });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'El email ya ha sido verificado',
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar email de verificación',
      });
    }

    res.json({
      success: true,
      message: 'Email de verificación reenviado',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reenviar verificación',
      error: error.message,
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  verifyEmail,
  resendVerification,
};
