# Mô hình cơ sở dữ liệu MongoDB

Theo đề bài yêu cầu tối thiểu 4 collection `Users`, `Courses`, `Enrollments`, `Assignments`. Hệ thống bổ sung `Submissions` để quản lý việc **nộp bài và chấm điểm độc lập**.

## 1. Users

`_id:ObjectId`, `name:String`, `email:String (unique, lowercased)`, `passwordHash:String (bcrypt, select:false)`, `role:enum(admin,teacher,student)`, `isActive:Boolean`, `avatarColor:String`, `createdAt`, `updatedAt`.

## 2. Courses

`_id:ObjectId`, `title:String`, `description:String`, `category:String`, `level:enum`, `duration:Number`, `status:enum(published,draft)`, `teacher:ObjectId -> Users`, `materials: Array[{_id,title,type:enum(pdf,video,text),content,storedName,originalName}]`, `createdAt`, `updatedAt`.

`materials` được nhúng vào Courses vì mỗi học liệu chỉ thuộc một khóa học. Tệp vật lý nằm trong `server/uploads` và được truy cập qua API kiểm soát quyền.

## 3. Enrollments

`_id:ObjectId`, `course:ObjectId -> Courses`, `student:ObjectId -> Users`, `completedMaterials:ObjectId[]`, `enrolledAt:Date`, `createdAt`, `updatedAt`.

Chỉ mục unique `(course,student)` nhằm ngăn sinh viên ghi danh trùng cùng một lớp.

## 4. Assignments

`_id:ObjectId`, `course:ObjectId -> Courses`, `title:String`, `instructions:String`, `deadline:Date?`, `maxScore:Number`, `createdAt`, `updatedAt`.

## 5. Submissions

`_id:ObjectId`, `assignment:ObjectId -> Assignments`, `student:ObjectId -> Users`, `textAnswer:String`, `storedName:String`, `originalName:String`, `score:Number|null`, `feedback:String`, `gradedAt:Date|null`, `createdAt`, `updatedAt`.

Chỉ mục unique `(assignment,student)` để mỗi sinh viên có một bài nộp hiện hành cho mỗi bài tập; có thể cập nhật trước hạn và trước khi chấm.

## Quan hệ dữ liệu

```
Users (Teacher) 1 ─── N Courses
Users (Student) 1 ─── N Enrollments N ─── 1 Courses
Courses         1 ─── N Assignments
Assignments     1 ─── N Submissions N ─── 1 Users (Student)
Courses         1 ─── N Materials (embedded subdocuments)
Enrollments     1 ─── N completedMaterials (ObjectId[])
```

## Quy tắc nghiệp vụ

1. Chỉ student/teacher được tự đăng ký; quyền Admin chỉ được cấp qua seed có kiểm soát hoặc qua quản trị CSDL.
2. Tài khoản bị khóa không đăng nhập và không dùng được JWT cũ.
3. Teacher chỉ tạo/sửa/xóa khóa học, tài liệu, bài tập thuộc về mình; Admin quản lý danh mục và có quyền xóa khóa học.
4. Student chỉ đọc học liệu và bài tập sau khi ghi danh; khóa học bản nháp không mở cho sinh viên.
5. Sinh viên chỉ đánh dấu hoàn thành tài liệu tồn tại trong khóa học đã ghi danh.
6. Sinh viên nộp text hoặc file; không được nộp bài sau hạn, không thể nộp lại sau khi giảng viên đã chấm.
7. Điểm trong `[0,maxScore]`, nhận xét tùy chọn; điểm hiển thị cho đúng sinh viên.
8. Khi xóa khóa học, xóa ghi danh, bài tập, bài nộp liên quan; tệp học liệu PDF được xóa. **Giới hạn hiện tại:** tệp bài nộp của học viên chưa được dọn dẹp tự động khi xóa khóa học; có thể bổ sung garbage-collection cho production.
9. Tải PDF và tệp bài nộp đi qua API xác thực thay vì public static files.

