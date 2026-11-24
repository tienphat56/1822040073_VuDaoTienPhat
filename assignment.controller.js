import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { assertId, fail, required } from '../utils/http.js';
import { getCourse, needMember, needOwner } from './helpers.js';
import { filePath, deleteUpload } from '../middleware/upload.js';
import fs from 'node:fs';
const getAssignment = async id => { assertId(id); const a = await Assignment.findById(id); if (!a) fail(404, 'Không tìm thấy bài tập'); return a; };
export const listAssignments = async (req, res) => {
  const course = await getCourse(req.params.id); await needMember(course, req.user);
  const assignments = await Assignment.find({ course: course.id }).sort({ deadline: 1, createdAt: -1 });
  let submissions = [];
  if (req.user.role === 'student') submissions = await Submission.find({ student: req.user.id, assignment: { $in: assignments.map(a => a.id) } });
  res.json({ assignments: assignments.map(a => ({ ...a.toObject(), mySubmission: submissions.find(s => String(s.assignment) === a.id) || null })) });
};
export const createAssignment = async (req, res) => {
  const course = await getCourse(req.params.id); needOwner(course, req.user);
  const title = required(req.body.title, 'Tên bài tập', 160);
  const instructions = required(req.body.instructions, 'Yêu cầu bài tập', 8000);
  const deadline = req.body.deadline ? new Date(req.body.deadline) : undefined;
  if (deadline && isNaN(deadline.valueOf())) fail(400, 'Hạn nộp không hợp lệ');
  const maxScore = Number(req.body.maxScore ?? 10);
  if (maxScore < 1 || maxScore > 100 || !Number.isFinite(maxScore)) fail(400, 'Điểm tối đa phải từ 1 đến 100');
  const assignment = await Assignment.create({ course: course.id, title, instructions, deadline, maxScore });
  res.status(201).json({ assignment });
};
export const submit = async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  const course = await getCourse(assignment.course); await needMember(course, req.user);
  if (assignment.deadline && new Date() > assignment.deadline) fail(400, 'Đã quá hạn nộp bài');
  const textAnswer = String(req.body.textAnswer || '').trim();
  if (!textAnswer && !req.file) fail(400, 'Vui lòng nhập câu trả lời hoặc đính kèm tệp');
  if (textAnswer.length > 12000) fail(400, 'Câu trả lời quá dài');
  const previous = await Submission.findOne({ assignment: assignment.id, student: req.user.id });
  if (previous?.gradedAt) fail(400, 'Bài đã được chấm điểm, không thể nộp lại');
  const data = { textAnswer, storedName: req.file?.filename || previous?.storedName || '', originalName: req.file?.originalname || previous?.originalName || '' };
  const submission = await Submission.findOneAndUpdate({ assignment: assignment.id, student: req.user.id }, { $set: data }, { upsert: true, new: true, runValidators: true });
  if (req.file && previous?.storedName) deleteUpload(previous.storedName);
  res.json({ submission, message: 'Đã nộp bài thành công' });
};
export const getSubmissions = async (req, res) => {
  const assignment = await getAssignment(req.params.id); const course = await getCourse(assignment.course);
  needOwner(course, req.user);
  const submissions = await Submission.find({ assignment: assignment.id }).populate('student', 'name email').sort({ updatedAt: -1 });
  res.json({ assignment, course: { _id: course.id, title: course.title }, submissions });
};
export const grade = async (req, res) => {
  const assignment = await getAssignment(req.params.id); const course = await getCourse(assignment.course);
  needOwner(course, req.user); assertId(req.params.sid);
  const submission = await Submission.findOne({ _id: req.params.sid, assignment: assignment.id });
  if (!submission) fail(404, 'Không tìm thấy bài nộp');
  const score = Number(req.body.score);
  if (!Number.isFinite(score) || score < 0 || score > assignment.maxScore) fail(400, `Điểm phải từ 0 đến ${assignment.maxScore}`);
  submission.score = score; submission.feedback = String(req.body.feedback || '').slice(0, 4000); submission.gradedAt = new Date();
  await submission.save(); res.json({ submission });
};
export const downloadSubmission = async (req, res) => {
  const assignment = await getAssignment(req.params.id); const course = await getCourse(assignment.course);
  assertId(req.params.sid);
  const submission = await Submission.findOne({ _id: req.params.sid, assignment: assignment.id });
  if (!submission || !submission.storedName) fail(404, 'Không tìm thấy tệp bài nộp');
  if (req.user.role === 'student') { if (String(submission.student) !== String(req.user.id)) fail(403, 'Không có quyền xem tệp'); }
  else needOwner(course, req.user);
  const location = filePath(submission.storedName);
  if (!fs.existsSync(location)) fail(404, 'Tệp bài nộp không còn tồn tại');
  res.download(location, submission.originalName || 'assignment-file');
};
