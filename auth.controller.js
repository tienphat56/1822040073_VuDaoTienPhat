import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { fail, required } from '../utils/http.js';
const publicUser = user => ({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, avatarColor: user.avatarColor });
export const register = async (req, res) => {
  const name = required(req.body.name, 'Họ tên', 100);
  const email = required(req.body.email, 'Email', 254).toLowerCase();
  const password = req.body.password;
  const role = req.body.role === 'teacher' ? 'teacher' : 'student'; // Không cho tự đăng ký admin
  if (!/^\S+@\S+\.\S+$/.test(email)) fail(400, 'Email không hợp lệ');
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) fail(400, 'Mật khẩu phải từ 8 đến 128 ký tự');
  if (await User.exists({ email })) fail(409, 'Email đã được sử dụng');
  const user = await User.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ message: 'Đăng ký thành công', user: publicUser(user) });
};
export const login = async (req, res) => {
  const email = required(req.body.email, 'Email').toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(String(req.body.password ?? ''), user.passwordHash))) fail(401, 'Email hoặc mật khẩu không đúng');
  if (!user.isActive) fail(403, 'Tài khoản đã bị khóa');
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h' });
  res.json({ token, user: publicUser(user) });
};
export const me = async (req, res) => res.json({ user: publicUser(req.user) });
