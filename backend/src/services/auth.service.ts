import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { CreateUserDto, LoginDto } from '../types/index.js';

export class AuthService {
  async register(data: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    return user;
  }
}
