import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { assertId, fail } from '../utils/http.js';
export const getCourse = async id => {
  assertId(id);
  const course = await Course.findById(id).populate('teacher', 'name email avatarColor');
  if (!course) fail(404, 'Không tìm thấy khóa học');
  return course;
};
export const isOwner = (course, user) => user.role === 'admin' || String(course.teacher?._id || course.teacher) === String(user.id);
export const needOwner = (course, user) => { if (!isOwner(course, user)) fail(403, 'Chỉ giảng viên phụ trách mới được thao tác'); };
export const needMember = async (course, user) => {
  if (isOwner(course, user)) return;
  if (course.status !== 'published') fail(403, 'Khóa học chưa được công bố');
  if (!await Enrollment.exists({ course: course._id, student: user.id })) fail(403, 'Bạn chưa ghi danh khóa học này');
};
