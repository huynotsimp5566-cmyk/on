# Ôn Bài: web ôn thi trắc nghiệm (Firebase)

Đăng nhập Gmail, chọn môn, làm trắc nghiệm. Gói Free giới hạn số câu mỗi ngày, gói Pro (tuần 20.000đ, tháng 80.000đ) mở khóa không giới hạn, flashcards, ôn câu sai và thống kê. Thanh toán bằng QR chuyển khoản, admin duyệt tay.

## Xem thử ngay, chưa cần Firebase

Mở thư mục `public` bằng một server tĩnh, ví dụ:

    cd public
    python3 -m http.server 8000

Vào http://localhost:8000. Khi `config.js` còn chữ `YOUR_...`, web chạy ở chế độ xem thử: đăng nhập giả, dữ liệu lưu trong trình duyệt, và tài khoản thử chính là admin nên bạn xem được cả luồng "gửi thanh toán, duyệt, bật Pro".

## Cài đặt Firebase (làm một lần, khoảng 15 phút)

1. Vào https://console.firebase.google.com, tạo project mới (gói Spark miễn phí là đủ cho lớp học).
2. Build > Authentication > Get started > Sign-in method > bật Google.
3. Build > Firestore Database > Create database (chọn vùng asia-southeast1, Production mode).
4. Project settings > Your apps > thêm Web app (biểu tượng `</>`). Copy `firebaseConfig` vào `public/config.js`.
5. Sửa `public/config.js`: `adminEmail` (Gmail của bạn) và `bank` (mã ngân hàng VietQR, số tài khoản, tên chủ tài khoản).
6. Sửa `firestore.rules`: thay `ADMIN_GMAIL@gmail.com` bằng đúng Gmail admin.
7. Cài công cụ và đưa lên mạng:

        npm install -g firebase-tools
        firebase login
        firebase use --add        # chọn project vừa tạo
        firebase deploy

   Xong sẽ có địa chỉ dạng `https://ten-project.web.app`.

Nếu dùng tên miền riêng, thêm nó vào Authentication > Settings > Authorized domains.

## Cách vận hành hằng ngày

- Người dùng chọn gói, quét QR, chuyển khoản đúng số tiền và nội dung, bấm "Tôi đã chuyển khoản".
- Bạn vào `/#/admin`, mở app ngân hàng đối chiếu số tiền và nội dung, bấm Duyệt. Pro bật ngay, cộng dồn nếu còn hạn.

## Thêm môn mới

1. Tạo `public/data/<mon>.js` giống `public/data/su.js` (mỗi câu có id riêng, `l` là số bài, `c` đáp án đúng, `w` ba đáp án sai, `e` giải thích).
2. Trong `public/app.js`, `import` môn mới và thêm vào mảng `SUBJECTS` (thay dòng "Tiếng Anh" đang để "Sắp có").

Không đổi id của các câu đã có, nếu không thống kê của người dùng sẽ lệch.

## Giới hạn cần biết

- Giới hạn câu mỗi ngày của gói Free và các tính năng Pro được kiểm tra trên trình duyệt. Người rành kỹ thuật có thể lách. Với lớp học thì đủ dùng. Muốn chặt hơn cần Cloud Functions (phải bật gói Blaze).
- Câu hỏi nằm trong file `data/*.js` nên ai xem mã nguồn trang đều thấy được.
- Giá gói tuần, tháng nằm ở cả `config.js` và `firestore.rules`. Đổi giá thì sửa cả hai chỗ.
