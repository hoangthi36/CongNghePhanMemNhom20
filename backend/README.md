# Backend API — Tài liệu tóm tắt

Tài liệu này mô tả API liên quan đến **household (hộ gia đình)** mà backend hiện đang cung cấp trong repository này.

**Base route:** `/api/house-hold`

**Lưu ý quan trọng:** Các controller yêu cầu thông tin user đã xác thực trong `req.user`.
Một số thao tác đọc `req.user.identification` và `req.user._id`.
Frontend cần đảm bảo middleware xác thực cung cấp thông tin người dùng (VD: qua token đã xác minh).

---

## Tóm tắt Schema (HouseHold)

- **namehousehold** (String, bắt buộc) — tên hộ gia đình
- **address** (String, bắt buộc)
- **namehead** (String, bắt buộc) — tên chủ hộ (backend tự đặt từ user hiện tại)
- **identification_head** (String, bắt buộc) — số định danh của chủ hộ (backend tự đặt từ user hiện tại)
- **members** (Array) — danh sách thành viên:
  `{ identification: String, name: String, relationship: String }`

**Lưu ý:** `identification_head` được đánh index unique — mỗi số định danh chủ hộ chỉ thuộc **1 hộ gia đình**.

---

## Các Endpoint (tóm tắt + ví dụ)

### 1. Tạo hộ gia đình

- **Method:** POST

- **Path:** `/api/house-hold/create-household`

- **Auth:** bắt buộc (dựa vào `req.user.identification`)

- **Headers:**

  - Content-Type: application/json
  - Authorization: Bearer `<token>`

- **Body (JSON):**

```json
{
  "name": "Nguyen Family",
  "address": "123 Le Loi, HCM",
  "members": [
    { "identification": "ID002", "name": "Nguyen Van B", "relationship": "con" }
  ]
}
```

- **Success (201):** trả về object household đã tạo

```json
{
  "_id": "<household-id>",
  "namehousehold": "Nguyen Family",
  "address": "123 Le Loi, HCM",
  "namehead": "Nguyen Van A",
  "identification_head": "ID001",
  "members": [
    {
      "identification": "ID002",
      "name": "Nguyen Van B",
      "relationship": "con",
      "_id": "..."
    }
  ],
  "__v": 0
}
```

- **Errors:**

  - 400 — tên hộ trùng, `members` không phải mảng, user đã thuộc hộ khác
  - 404 — user không tồn tại
  - 500 — lỗi server

**Lưu ý frontend:** chỉ cần gửi `name`, `address`, `members`; backend tự gán chủ hộ từ `req.user`.

---

### 2. Cập nhật hộ gia đình

- **Method:** PATCH

- **Path:** `/api/house-hold/update-hosehold`

  - **CHÚ Ý:** route đang bị sai chính tả (`hosehold`).
    Bạn phải gọi đúng đường dẫn này trừ khi sửa backend.

- **Auth:** bắt buộc (`req.user._id`)

- **Body:** có thể gửi bất kỳ field nào để cập nhật:

```json
{
  "name": "Tên mới",
  "address": "Địa chỉ mới",
  "members": [ ... ]
}
```

- **Success (200):** trả về household đã cập nhật
- **Errors:**

  - 404 — user không thuộc hộ nào
  - 403 — chỉ **chủ hộ** (user.name == namehead) mới được cập nhật
  - 400 — `members` không phải array

---

### 3. Đọc hộ gia đình theo số định danh chủ hộ

- **Method:** GET

- **Path:** `/api/house-hold/read-household/:identification_head`

- **Params:** `identification_head` — string

- **Success (200):** trả về household

- **Errors:**

  - 404 — không tìm thấy hộ

---

### 4. Các controller khác (chưa có route)

- **getAllHouseHolds** — GET có phân trang (page=N), trả về 50 item/page
  → nên thêm route như: `GET /api/house-hold?page=1`

- **deleteHouseHold** — xóa hộ theo chủ hộ
  → nên thêm route: `DELETE /api/house-hold/delete-household`

---

## Ví dụ cURL

### Tạo household (cần token)

```sh
curl -X POST "http://localhost:5000/api/house-hold/create-household" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{ "name": "Nguyen Family", "address": "123 Le Loi, HCM", "members": [{ "identification": "ID002", "name": "Nguyen Van B", "relationship": "con" }] }'
```

### Đọc household theo identification_head

```sh
curl -X GET "http://localhost:5000/api/house-hold/read-household/ID001"
```

### Cập nhật household (cần token)

```sh
curl -X PATCH "http://localhost:5000/api/house-hold/update-hosehold" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{ "name": "Nguyen Family Updated", "address": "456 Nguyen Hue" }'
```

---

## Checklist nhanh cho Frontend

- Luôn gửi auth token cho các route create/update.
- Đảm bảo middleware backend set `req.user` (có identification và `_id`).
- Gửi `members` đúng định dạng array object.
- `identification_head` là unique — 1 người chỉ làm chủ 1 hộ.

---

## Ghi chú về user & id

- Model `User` dùng `_id: String` làm khóa chính, và có virtual `identification` trỏ về `_id`.
- Khi tạo user mới cần set `_id` hoặc `identification` rõ ràng.
- Nếu trước đó có dùng ObjectId, có thể cần migration khi chuyển sang ID dạng string.

---
