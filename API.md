# RESTful API — EduSpace

**Base URL:** `http://localhost:5000/api`

Header cho các endpoint yêu cầu đăng nhập: `Authorization: Bearer <JWT>`.
Mặc định request/response ở dạng JSON, riêng upload sử dụng `multipart/form-data`. Nếu lỗi: `{ "message": "Thông báo lỗi" }`.

## Xác thực

| Method | Endpoint | Vai trò | Mục đích |
|---|---|---|---|
| POST | `/auth/register` | Công khai | Đăng ký; body `{name,email,password,role}` (role student/teacher) |
| POST | `/auth/login` | Công khai | Đăng nhập; body `{email,password}`, trả về JWT + user |
| GET | `/auth/me` | Đã đăng nhập | Đọc thông tin người dùng từ JWT |
| GET | `/health` | Công khai | Kiểm tra server và trạng thái kết nối MongoDB |

## Khóa học, học liệu và ghi danh

| Method | Endpoint | Vai trò | Mục đích |
|---|---|---|---|
| GET | `/courses` | Tất cả | Danh sách khóa học công khai; query `search`, `category` |
| GET | `/courses/mine` | Teacher, Student | Khóa học do tôi dạy hoặc đã ghi danh |
| GET | `/courses/:id` | Tất cả | Thông tin chi tiết; học liệu chỉ hiện với thành viên/chủ sở hữu |
| POST | `/courses` | Teacher | Tạo khóa học; `{title,description,category,level,duration,status}` |
| PATCH | `/courses/:id` | Teacher chủ sở hữu, Admin | Cập nhật khóa học |
| DELETE | `/courses/:id` | Teacher chủ sở hữu, Admin | Xóa khóa học và dữ liệu phụ thuộc |
| POST | `/courses/:id/materials` | Teacher chủ sở hữu | Thêm tài liệu bằng `multipart/form-data`: `title,type,content,file` |
| DELETE | `/courses/:id/materials/:mid` | Teacher chủ sở hữu, Admin | Xóa tài liệu |
| GET | `/courses/:id/materials/:mid/file` | Chủ sở hữu hoặc đã ghi danh | Đọc tệp PDF có kiểm soát truy cập |
| POST | `/courses/:id/enroll` | Student | Ghi danh; chống trùng theo unique index |
| PATCH | `/courses/:id/progress/:mid` | Student đã ghi danh | Đánh dấu tài liệu đã hoàn thành |
| GET | `/courses/:id/students` | Teacher chủ sở hữu, Admin | Xem danh sách sinh viên và tiến độ |
| GET | `/courses/:id/assignments` | Chủ sở hữu hoặc đã ghi danh | Xem bài tập, sinh viên có trường `mySubmission` |
| POST | `/courses/:id/assignments` | Teacher chủ sở hữu | Tạo bài tập: `{title,instructions,deadline,maxScore}` |

**Material type**: `text` dùng trường `content` là nội dung; `video` dùng `content` là URL http/https; `pdf` dùng trường `file` là tệp PDF tối đa 10MB. **Lưu ý:** tệp PDF không được expose qua static middleware mà qua API có JWT.

## Nộp bài và chấm điểm

| Method | Endpoint | Vai trò | Mục đích |
|---|---|---|---|
| POST | `/assignments/:id/submit` | Student đã ghi danh | Nộp hoặc nộp lại bài text/tệp (`textAnswer`, `file`) trước hạn, nếu chưa chấm |
| GET | `/assignments/:id/submissions` | Teacher chủ sở hữu, Admin | Xem danh sách bài nộp, thông tin sinh viên |
| PATCH | `/assignments/:id/submissions/:sid/grade` | Teacher chủ sở hữu, Admin | Chấm điểm (`score`, `feedback`) |
| GET | `/assignments/:id/submissions/:sid/file` | Teacher chủ sở hữu, Admin, Student sở hữu | Tải file nộp bài |

## Quản trị

| Method | Endpoint | Vai trò | Mục đích |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Tổng số tài khoản, khóa học, ghi danh, bài tập |
| GET | `/admin/users` | Admin | Danh sách tài khoản |
| PATCH | `/admin/users/:id/status` | Admin | Khóa/mở khóa, `{isActive:true/false}` |
| GET | `/admin/courses` | Admin | Toàn bộ khóa học, kể cả bản nháp |
| PATCH | `/admin/courses/:id/status` | Admin | Công khai/ẩn khóa học `{status:'published'/'draft'}` |

## Ví dụ cURL

Đăng nhập:

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"student@classroom.local","password":"ChangeMe123!"}'
```

Dùng giá trị `token` trả về để gọi API đăng nhập:

```bash
curl http://localhost:5000/api/courses -H "Authorization: Bearer <TOKEN>"
```

## HTTP status code

- `200`: lấy hoặc cập nhật thành công; `201`: tạo mới/ghi danh.
- `400`: dữ liệu không hợp lệ; `401`: thiếu JWT, JWT không hợp lệ/hết hạn.
- `403`: không được phép/đã khóa; `404`: không tìm thấy; `409`: trùng dữ liệu.
- `500`: sự cố máy chủ, log lỗi được in trên server.

