# Camhu Lab — hướng dẫn deploy lên Vercel (qua Git)

Phiên bản 3.0.0. Một trang web tĩnh gồm ba phần học và một máy chủ nhỏ để đăng nhập, đồng bộ tiến độ.

| File | Vai trò |
|---|---|
| `index.html` | Trang chủ Camhu Lab: đăng nhập, chọn phần học, xem tiến độ |
| `n1.html` | Ôn thi JLPT N1 — 84 ngày, mỗi ngày một đề đủ barem (66 + 30 câu) |
| `en.html` | English 12 tuần (nội dung giữ nguyên từ web cũ) |
| `jp.html` | 日本語 12 tuần (nội dung giữ nguyên từ web cũ) |
| `assets/camhu.js`, `assets/camhu.css` | Thanh điều hướng chung, mascot, giao diện sáng/tối, đăng nhập và đồng bộ |
| `assets/profile.js` | Quản lý "người học trên máy này" (của web cũ) |
| `assets/favicon.png`, `assets/apple-touch-icon.png` | Logo Camhu |
| `api/lab.js` | Máy chủ đăng ký / đăng nhập / đồng bộ (Vercel Function, không cần cài thư viện) |
| `HUONG_DAN.md` | File này (không được đưa lên web nhờ `.vercelignore`) |

Không có bước build, không có `package.json`.

## Bước 1 — Đưa mã lên GitHub

**Trường hợp A — web cũ "Học mỗi ngày" đã có repo và đã nối với Vercel.** Chép toàn bộ nội dung thư mục này đè vào thư mục repo cũ (thay `index.html`, `en.html`, `jp.html`, `assets/profile.js`; thêm `n1.html`, `api/`, các file mới trong `assets/`). File `assets/avatar.png` cũ không còn được dùng, có thể xóa. Rồi:

```bash
git add -A
git commit -m "Camhu Lab v3.0.0"
git push
```

Vercel tự deploy lại, tên miền giữ nguyên. Tiến độ English / 日本語 mà mọi người đang lưu trên máy vẫn còn vì trang vẫn đọc đúng chỗ lưu cũ. Bỏ qua Bước 2.

**Trường hợp B — tạo mới.** Tạo một repo trống trên GitHub (ví dụ `camhu-lab`, để Private cũng được), rồi trong thư mục này chạy:

```bash
git init
git add .
git commit -m "Camhu Lab v3.0.0"
git branch -M main
git remote add origin https://github.com/<tên-github-của-bạn>/camhu-lab.git
git push -u origin main
```

## Bước 2 — Tạo project trên Vercel (chỉ trường hợp B)

1. Vào Vercel → **Add New… → Project** → chọn repo vừa đẩy lên → **Import**.
2. **Framework Preset**: `Other`. Để trống Build Command và Output Directory.
3. Bấm **Deploy**.

Xong bước này trang đã dùng được ở chế độ "người học trên máy này" (tiến độ lưu trên từng thiết bị). Nút Đăng nhập sẽ báo máy chủ chưa được nối với cơ sở dữ liệu cho tới khi làm Bước 3.

## Bước 3 — Tạo database (Upstash Redis, gói miễn phí)

1. Trong Vercel mở project → tab **Storage** → **Create Database** (hoặc **Browse Marketplace**) → chọn **Upstash** → **Upstash for Redis**.
2. Chọn gói **Free**, chọn khu vực gần Việt Nam (Singapore hoặc Tokyo nếu có) → **Create**.
3. Nối database với project: **Connect Project** → chọn project của bạn, tick cả Production và Preview. Không cần điền Custom Prefix.

Vercel tự thêm các biến môi trường của database vào project. Tên nút trên Vercel có thể khác đôi chút tùy thời điểm.

## Bước 4 — Deploy lại

Biến môi trường mới chỉ có hiệu lực từ lần deploy sau. Vào tab **Deployments** → bấm **⋯** ở bản mới nhất → **Redeploy** (hoặc đẩy thêm một commit bất kỳ).

## Bước 5 — Kiểm tra

Mở `https://<tên-miền-của-bạn>/api/lab`. Nếu thấy:

```json
{"ok":true,"app":"Camhu Lab","version":"3.0.0","configured":true,"invite":false}
```

thì máy chủ đã sẵn sàng. Mở trang chủ → **Đăng ký** để tạo tài khoản đầu tiên, làm thử vài câu ở Ôn thi N1, rồi đăng nhập trên điện thoại để xem tiến độ có theo sang không.

- `"configured":false` → project chưa thấy biến môi trường của database. Vào **Settings → Environment Variables**, phải có một cặp biến kết thúc bằng `REST_API_URL` và `REST_API_TOKEN` (ví dụ `KV_REST_API_URL` / `KV_REST_API_TOKEN`, hoặc `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`), rồi Redeploy.
- `/api/lab` báo 404 → thư mục `api/` chưa được đẩy lên repo.

## Nên bật: mã mời

Đường link là công khai, ai có link cũng đăng ký được. Để chỉ bạn bè đăng ký được:

**Settings → Environment Variables** → thêm `INVITE_CODE` = một chuỗi bạn tự đặt (ví dụ `camhu2026`) → Redeploy. Khi đó form Đăng ký hỏi thêm "Mã mời", và `/api/lab` trả về `"invite":true`.

Biến `AUTH_SECRET` (chuỗi ngẫu nhiên dài) là tùy chọn: nếu không đặt, máy chủ tự suy ra khóa ký phiên đăng nhập từ khóa của database.

## Hai cách dùng: tài khoản và "người học trên máy này"

- **Tài khoản** (đăng ký / đăng nhập): tiến độ cả ba phần N1, English, 日本語 được lưu trên máy chủ và theo bạn sang mọi thiết bị. Khi đăng ký, tiến độ đang có trên máy đó được chép vào tài khoản mới.
- **Người học trên máy này** (cách của web cũ, không cần mật khẩu): tiến độ chỉ nằm trong trình duyệt của thiết bị đó. Đổi máy thì dùng **Sao lưu tiến độ / Khôi phục** ở trang chủ; file sao lưu chỉ gồm English và 日本語, muốn mang cả tiến độ N1 sang máy khác thì đăng ký tài khoản.

Nếu mở cùng một tài khoản trên hai máy cùng lúc, với mỗi bài, bản được sửa sau cùng là bản được giữ.

## Cập nhật phiên bản mới

Thay các file thay đổi → `git add -A && git commit -m "..." && git push`. Vercel tự deploy lại, đường link giữ nguyên, tài khoản và tiến độ của mọi người không mất.

## Quản lý tài khoản

Dữ liệu nằm trong Upstash (xem bằng **Data Browser** trong trang database):

| Khóa | Nội dung |
|---|---|
| `u:<tên đăng nhập>` | Tài khoản: tên hiển thị, mật khẩu đã băm (scrypt, không đọc ngược lại được) |
| `d:<tên đăng nhập>` | Tiến độ: bài làm N1 từng ngày, điểm, thẻ đã thuộc, tiến độ English và 日本語, hồ sơ |

- **Bạn bè quên mật khẩu:** trang không gửi email lấy lại mật khẩu. Bạn xóa khóa `u:<tên>` rồi bảo bạn ấy đăng ký lại đúng tên đó; tiến độ (`d:<tên>`) vẫn còn.
- **Xóa hẳn một người:** xóa cả `u:<tên>` và `d:<tên>`.

## Giới hạn gói miễn phí

Upstash Free cho khoảng 500.000 lệnh mỗi tháng (con số do Upstash quy định, có thể thay đổi). Mỗi lần tải tiến độ tốn 1 lệnh, mỗi lần lưu tốn 2 lệnh; khi đang làm bài trang lưu tối đa 20 giây một lần. Một nhóm bạn học mỗi ngày một đề dùng khoảng vài chục nghìn lệnh mỗi tháng.

## Chạy không cần máy chủ

Mở thẳng `index.html` bằng trình duyệt vẫn học được với "người học trên máy này" (không đăng nhập, tiến độ lưu trên máy đó).

## Lưu ý về nội dung

Đề luyện N1, câu hỏi kiểu TOEIC và các bài kaiwa là tài liệu luyện tập tự soạn theo đúng dạng đề, không phải đề thi thật và không phải tài liệu chính thức của Japan Foundation, JEES hay ETS.
