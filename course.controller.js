import fs from 'node:fs';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { assertId, fail, required } from '../utils/http.js';
import { filePath, deleteUpload } from '../middleware/upload.js';
import { getCourse, isOwner, needOwner, needMember } from './helpers.js';
const serialize = async (course, user) => {
  const obj = course.toObject();
  let enrollment = null;
  if (user?.role === 'student') enrollment = await Enrollment.findOne({ course: course._id, student: user.id });
  const accessible = user && (isOwner(course, user) || !!enrollment);
  if (!accessible) obj.materials = [];
  return { ...obj, isEnrolled: !!enrollment, progress: enrollment && course.materials.length ? Math.round(enrollment.completedMaterials.length / course.materials.length * 100) : 0, completedMaterials: enrollment?.completedMaterials || [] };
};
export const listCourses = async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { status: 'published' };
  if (req.query.search) filter.title = { $regex: String(req.query.search).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (req.query.category && req.query.category !== 'Tất cả') filter.category = req.query.category;
  const courses = await Course.find(filter).populate('teacher', 'name avatarColor').sort({ createdAt: -1 }).limit(100);
  const counts = await Enrollment.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map(c => [String(c._id), c.count]));
  res.json({ courses: courses.map(c => ({ ...c.toObject(), materials: undefined, materialsCount: c.materials.length, studentsCount: countMap.get(c.id) || 0 })) });
};
export const myCourses = async (req, res) => {
  if (req.user.role === 'teacher') {
    const courses = await Course.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    return res.json({ courses });
  }
  const enrollments = await Enrollment.find({ student: req.user.id }).populate({ path: 'course', populate: { path: 'teacher', select: 'name' } }).sort({ enrolledAt: -1 });
  const data = enrollments.filter(e => e.course).map(e => ({ ...e.course.toObject(), progress: e.course.materials.length ? Math.round(e.completedMaterials.length / e.course.materials.length * 100) : 0, enrolledAt: e.enrolledAt }));
  res.json({ courses: data });
};
export const detail = async (req, res) => {
  const course = await getCourse(req.params.id);
  if (course.status !== 'published' && !isOwner(course, req.user)) fail(403, 'Khóa học đang ở chế độ nháp');
  res.json({ course: await serialize(course, req.user) });
};
export const createCourse = async (req, res) => {
  const title = required(req.body.title, 'Tên khóa học', 160);
  const description = required(req.body.description, 'Mô tả', 4000);
  const course = await Course.create({ title, description, teacher: req.user.id,
    category: String(req.body.category || 'Công nghệ thông tin').slice(0, 80),
    level: ['Cơ bản', 'Trung cấp', 'Nâng cao'].includes(req.body.level) ? req.body.level : 'Cơ bản',
    duration: Number(req.body.duration) || 8,
    status: ['draft', 'published'].includes(req.body.status) ? req.body.status : 'published' });
  res.status(201).json({ course });
};
export const updateCourse = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  for (const key of ['title', 'description', 'category', 'level', 'duration', 'status']) if (req.body[key] !== undefined) course[key] = req.body[key];
  await course.save(); res.json({ course });
};
export const removeCourse = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  const assignments = await Assignment.find({ course: course._id }).select('_id');
  await Submission.deleteMany({ assignment: { $in: assignments.map(x => x._id) } });
  await Assignment.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  for (const material of course.materials) deleteUpload(material.storedName);
  await course.deleteOne();
  res.json({ message: 'Đã xóa khóa học' });
};
export const addMaterial = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  const title = required(req.body.title, 'Tên tài liệu', 160);
  const type = req.body.type;
  if (!['pdf', 'video', 'text'].includes(type)) fail(400, 'Loại tài liệu không hợp lệ');
  if (type === 'pdf' && !req.file) fail(400, 'Vui lòng tải lên tệp PDF');
  if (type !== 'pdf' && req.file) { deleteUpload(req.file.filename); fail(400, 'Loại tài liệu này không cần tải tệp'); }
  const content = type === 'pdf' ? '' : required(req.body.content, 'Nội dung tài liệu', 20000);
  if (type === 'video') { try { const url = new URL(content); if (!['http:', 'https:'].includes(url.protocol)) throw Error(); } catch { fail(400, 'Liên kết video phải là HTTP hoặc HTTPS'); } }
  course.materials.push({ title, type, content, storedName: req.file?.filename || '', originalName: req.file?.originalname || '' });
  await course.save(); res.status(201).json({ material: course.materials.at(-1) });
};
export const deleteMaterial = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  assertId(req.params.mid);
  const material = course.materials.id(req.params.mid); if (!material) fail(404, 'Không tìm thấy tài liệu');
  deleteUpload(material.storedName); material.deleteOne(); await course.save();
  await Enrollment.updateMany({ course: course.id }, { $pull: { completedMaterials: req.params.mid } });
  res.json({ message: 'Đã xóa tài liệu' });
};
export const downloadMaterial = async (req, res) => {
  const course = await getCourse(req.params.id); await needMember(course, req.user);
  assertId(req.params.mid);
  const material = course.materials.id(req.params.mid);
  if (!material || material.type !== 'pdf' || !material.storedName) fail(404, 'Không tìm thấy PDF');
  const location = filePath(material.storedName);
  if (!fs.existsSync(location)) fail(404, 'Tệp không còn trên máy chủ');
  res.type('pdf'); res.set('Content-Disposition', `inline; filename="document.pdf"`); res.sendFile(location);
};
export const enroll = async (req, res) => {
  const course = await getCourse(req.params.id);
  if (course.status !== 'published') fail(400, 'Khóa học chưa mở đăng ký');
  const e = await Enrollment.findOneAndUpdate({ course: course.id, student: req.user.id }, { $setOnInsert: { completedMaterials: [] } }, { upsert: true, new: true });
  res.status(201).json({ enrollment: e, message: 'Ghi danh thành công' });
};
export const markProgress = async (req, res) => {
  const course = await getCourse(req.params.id);
  assertId(req.params.mid);
  if (!course.materials.id(req.params.mid)) fail(404, 'Không tìm thấy tài liệu');
  const e = await Enrollment.findOneAndUpdate({ course: course.id, student: req.user.id }, { $addToSet: { completedMaterials: req.params.mid } }, { new: true });
  if (!e) fail(403, 'Bạn chưa ghi danh');
  res.json({ progress: course.materials.length ? Math.round(e.completedMaterials.length / course.materials.length * 100) : 0, completedMaterials: e.completedMaterials });
};
export const enrolledStudents = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  const enrollments = await Enrollment.find({ course: course.id }).populate('student', 'name email isActive').sort({ enrolledAt: -1 });
  res.json({ enrollments: enrollments.map(e => ({ ...e.toObject(), progress: course.materials.length ? Math.round(e.completedMaterials.length / course.materials.length * 100) : 0 })) });
};
