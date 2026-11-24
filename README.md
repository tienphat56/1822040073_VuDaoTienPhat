# EduSpace — Hệ thống lớp học trực tuyến (MERN Stack)

Đề tài tiểu luận cuối kỳ môn **Lập trình Web**: Online Classroom. Dự án gồm React + Vite (client), Node.js + Express (API), MongoDB + Mongoose (cơ sở dữ liệu), xác thực JWT và phân quyền **Admin / Teacher / Student**.

> Đây là dự án **mã nguồn hoàn chỉnh để triển khai ở máy có Node.js và MongoDB**. Môi trường tạo dự án không có khả năng tải npm packages hoặc chạy MongoDB, do đó tác giả đã kiểm tra mã nguồn ở mức cú pháp và unit test, nhưng **chưa xác nhận chạy end-to-end**. Hãy chạy các bước bên dưới và ghi lại ảnh giao diện thật trước khi nộp.

## 1. Các chức năng đã lập trình

| Vai trò | Chức năng |
|---|---|
| Chung | Đăng ký (student/teacher), đăng nhập JWT, điều hướng theo vai trò, đăng xuất |
| Teacher | Tạo/sửa/xóa khóa học, xuất bản/bản nháp, thêm/xóa học liệu (PDF, video URL, text), giao bài tập, xem sinh viên đã ghi danh và tiến độ, xem bài nộp, chấm điểm/nhận xét |
| Student | Xem/tìm kiếm/lọc khóa học, ghi danh, xem bài học, đánh dấu hoàn thành, theo dõi tiến độ, nộp bài text/tệp, xem điểm và nhận xét |
| Admin | Thống kê tổng quan, danh sách người dùng, khóa/mở khóa tài khoản, xem toàn bộ khóa học, công khai/ẩn khóa học, xem/xóa khóa học |

## 2. Công nghệ

- **Frontend:** React 19, React Router, Context API + Hooks, Vite, CSS responsive, Lucide icons.
- **Backend:** Node.js 20.19+, Express 5, JWT, bcryptjs, multer, CORS, Helmet, rate limiter.
- **Database:** MongoDB 8, Mongoose 9.
- **Các collection:** Users, Courses, Enrollments, Assignments, Submissions.
- **File:** Lưu PDF/bài nộp tại `server/uploads` trên máy chủ; tải qua endpoint có kiểm tra JWT và phân quyền.

## 3. Cài đặt local (Windows PowerShell / CMD)

**Yêu cầu:** Node.js 20.19 trở lên (khuyên dùng Node 22), npm, MongoDB đang chạy ở `127.0.0.1:27017`. Nếu dùng Docker Desktop: tại thư mục gốc chạy `docker compose up -d` để khởi động MongoDB.

### Bước 1 — Backend

```powershell
cd server
copy .env.example .env
npm install
```

Mở `server/.env`, thay `JWT_SECRET` bằng chuỗi bí mật bất kỳ **từ 32 ký tự trở lên, không dùng giá trị ví dụ**. Ví dụ tạo bằng Node:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Giữ `MONGODB_URI=mongodb://127.0.0.1:27017/online_classroom` nếu đang chạy Mongo local.

```powershell
npm run seed
npm run dev
```

API chạy tại `http://localhost:5000`; kiểm tra `http://localhost:5000/api/health`.

### Bước 2 — Frontend (mở terminal khác)

```powershell
cd client
copy .env.example .env
npm install
npm run dev
```

Mở trình duyệt tới **http://localhost:5173**.

### Bước 3 — Tài khoản minh họa (sau khi seed)

Các email và mật khẩu demo được lấy từ `server/.env`. Giá trị mẫu mặc định:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@classroom.local` | `ChangeMe123!` |
| Teacher | `teacher@classroom.local` | `ChangeMe123!` |
| Student | `student@classroom.local` | `ChangeMe123!` |

**Quan trọng:** Đây chỉ là thông tin phục vụ **demo trên máy local**. Thay mật khẩu, không dùng lệnh seed ở production. Script seed tạo 4 khóa học mẫu, bài đọc, video link tham khảo, 2 ghi danh mẫu và bài tập.

## 4. Kiểm tra và build

```powershell
# Trong thư mục server
npm test

# Trong thư mục client
npm run build
```

Bộ kiểm thử nhanh khuyên thực hiện: đăng nhập 3 vai trò, giảng viên tạo khóa học, thêm học liệu, giao bài, sinh viên ghi danh/đánh dấu hoàn thành/nộp bài, giảng viên chấm điểm, sinh viên xem điểm, admin khóa người dùng. Danh sách kiểm thử chi tiết: `docs/TEST_CASES.md`.

## 5. Cấu trúc thư mục

```
OnlineClassroom_MERN/
├── client/
│   ├── src/
│   │   ├── context/      # AuthContext, quản lý đăng nhập
│   │   ├── lib/          # Fetch API wrapper + JWT
│   │   ├── components/   # Giao diện chung (sidebar/cards)
│   │   ├── pages/        # Trang theo vai trò
│   │   └── styles/       # CSS responsive
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # REST routes
│   │   ├── controllers/  # Xử lý nghiệp vụ
│   │   ├── middleware/   # JWT/roles/upload
│   │   └── utils/
│   ├── scripts/seed.js
│   ├── tests/
│   ├── uploads/         # Bị loại khỏi Git
│   └── .env.example
├── docs/                 # API, database, test cases, ảnh minh họa
└── docker-compose.yml
```

## 6. Đưa lên GitHub (nộp link)

Tạo repo `online-classroom-mern` trên GitHub, chạy trong thư mục gốc:

```powershell
git init
git add .
git commit -m "feat: online classroom MERN project"
git branch -M main
git remote add origin https://github.com/TEN_TAI_KHOAN/online-classroom-mern.git
git push -u origin main
```

Thay `TEN_TAI_KHOAN` bằng tên GitHub **thật của bạn**. Đừng push file `.env`, `node_modules`, hay tệp người dùng. Nếu chưa đăng nhập GitHub thì xác thực theo hướng dẫn của GitHub. Kiểm tra repository có `README.md`, `client/`, `server/`, `docs/`.

## 7. Tài liệu kèm theo

- `docs/API.md`: Tài liệu RESTful API.
- `docs/DATABASE.md`: Thiết kế dữ liệu MongoDB và các quan hệ.
- `docs/TEST_CASES.md`: Kịch bản kiểm thử nghiệm thu.
- `docs/screenshots/`: Mockup minh họa để tham khảo; **không thay thế ảnh chạy thử thật**.
- `Bao_cao_Online_Classroom_MERN.pdf`: Báo cáo tiểu luận (đặt cạnh file ZIP).

## 8. Một số giới hạn của bản đồ án

Đây là hệ thống phục vụ môn học, **không phải ứng dụng production**. Tệp tải lên được giới hạn dung lượng và MIME nhưng chưa kiểm tra nội dung nhị phân, chưa tích hợp cloud storage, email xác minh, khôi phục mật khẩu hoặc chống virus; dữ liệu demo và quyền tự đăng ký teacher chỉ phù hợp trình diễn học thuật. Khi triển khai công khai cần bổ sung các biện pháp bảo mật thích hợp.

