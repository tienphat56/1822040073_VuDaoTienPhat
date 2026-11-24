# Kiểm thử nghiệm thu đề tài — Checklist

Trạng thái các case dưới đây là **chưa xác nhận thực tế** cho đến khi chạy app với MongoDB. Đây là kịch bản kiểm thử để sinh viên thực hiện trên máy cá nhân, không phải bảng kết quả kiểm thử đã chạy.

| ID | Vai trò | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC01 | Guest | Đăng ký email mới, mật khẩu >= 8 ký tự | Tạo thành công tài khoản Student/Teacher |
| TC02 | Guest | Đăng ký lại email cũ | Trả lỗi 409 |
| TC03 | Guest | Đăng nhập sai mật khẩu | Trả lỗi 401 |
| TC04 | Student | Mở `/courses/new` | Chuyển hướng do không có quyền |
| TC05 | Teacher | Tạo khóa học có tên, mô tả, danh mục | Khóa học hiện ở trang quản lý |
| TC06 | Teacher | Tải tài liệu PDF và lưu | Học liệu có thể xem sau khi ghi danh |
| TC07 | Teacher | Thêm bài học text và video URL | Hiển thị đúng loại tài liệu |
| TC08 | Student | Xem tài liệu khóa học chưa ghi danh | Không tiết lộ nội dung |
| TC09 | Student | Ghi danh 1 khóa học 2 lần | Không tạo bản ghi Enrollment trùng |
| TC10 | Student | Đánh dấu đã học tài liệu | % tiến độ tăng, không vượt 100% |
| TC11 | Teacher | Tạo bài tập với điểm tối đa 10 | Bài tập xuất hiện cho sinh viên đã ghi danh |
| TC12 | Student | Nộp bài dạng text hoặc file trước hạn | Có trạng thái đã nộp |
| TC13 | Student | Nộp bài sau hạn | Trả lỗi 400 |
| TC14 | Teacher | Chấm điểm bài sinh viên | Điểm, nhận xét được lưu |
| TC15 | Student | Xem bài tập đã được chấm | Chỉ xem điểm và nhận xét của bản thân |
| TC16 | Student | Nộp lại bài đã chấm | Trả lỗi 400 |
| TC17 | Admin | Khóa tài khoản Student | Không thể đăng nhập và dùng JWT cũ |
| TC18 | Admin | Mở khóa Student | Đăng nhập trở lại |
| TC19 | Admin | Chuyển khóa học sang draft | Biến mất khỏi danh sách công khai |
| TC20 | Teacher B | Sửa khóa học của Teacher A | Trả lỗi 403 |
| TC21 | Student A | Tải bài nộp của Student B | Trả lỗi 403 |
| TC22 | Guest | Gọi API với token giả hoặc hết hạn | Trả lỗi 401 |
| TC23 | Teacher | Tải file PDF >10MB | Bị từ chối |
| TC24 | Admin | Xem thống kê và danh sách users/courses | Chỉ Admin được quyền truy cập |

**Gợi ý ảnh nộp báo cáo:** login, dashboard, course list, course detail, teacher upload material, student enrollment/progress, assignment submission, teacher grading, admin users, admin courses. Thay ảnh mô phỏng bằng ảnh được chụp từ web chạy thật.
