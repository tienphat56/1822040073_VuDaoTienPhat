import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import { assertId, fail } from '../utils/http.js';
export const overview = async (_req, res) => {
  const [users, courses, enrollments, assignments] = await Promise.all([User.countDocuments(), Course.countDocuments(), Enrollment.countDocuments(), Assignment.countDocuments()]);
  res.json({ stats: { users, courses, enrollments, assignments } });
};
export const users = async (_req, res) => res.json({ users: await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 }) });
export const changeStatus = async (req, res) => {
  assertId(req.params.id);
  if (req.params.id === String(req.user.id)) fail(400, 'Không thể tự khóa tài khoản quản trị');
  if (typeof req.body.isActive !== 'boolean') fail(400, 'isActive phải là true hoặc false');
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('name email role isActive');
  if (!user) fail(404, 'Không tìm thấy tài khoản');
  res.json({ user });
};
export const allCourses = async (_req, res) => res.json({ courses: await Course.find().populate('teacher', 'name email').sort({ createdAt: -1 }) });
export const changeCourseStatus = async (req, res) => {
  assertId(req.params.id);
  if (!['draft', 'published'].includes(req.body.status)) fail(400, 'Trạng thái không hợp lệ');
  const course = await Course.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!course) fail(404, 'Không tìm thấy khóa học');
  res.json({ course });
};
