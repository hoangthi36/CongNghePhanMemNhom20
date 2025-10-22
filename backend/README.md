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

- **Path:** `/api/house-hold/update-household`

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

### 4. Additional endpoints (now exposed)

- **getAllHouseHolds** — GET `/api/house-hold/all-households` — optionally paginated via ?page=N (50 items per page)

- **deleteHouseHold** — DELETE `/api/house-hold/delete-household` — only the head of household can delete their household

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
curl -X PATCH "http://localhost:5000/api/house-hold/update-household" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{ "name": "Nguyen Family Updated", "address": "456 Nguyen Hue" }'
```

### Lấy danh sách toàn bộ households (paginated)

```sh
curl -X GET "http://localhost:5000/api/house-hold/all-households?page=1"
```

### Xoá household (cần token - chỉ chủ hộ)

```sh
curl -X DELETE "http://localhost:5000/api/house-hold/delete-household" \
 -H "Authorization: Bearer <token>"
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

## Thêm sửa thông tin cho user:<version mới nhất>

- URL: http://localhost:5000/api/user/update-profile

- input: {
  "identification": "001234567890",
  "phone": "0922222222",
  "currentPassword": "123456",
  "newPassword": "newpass789"
  }

- output: {
  "message": "Profile updated successfully",
  "user": {
  "\_id": "6950e95b17ab2eb56dc1ca10",
  "identification": "001234567890",
  "name": "Nguyễn Văn Test",
  "phone": "0922222222",
  "address": "123 Đường Test, Hà Nội",
  "dob": "1995-01-15T00:00:00.000Z"
  }
  }

## Thêm thành viên

- URL:http://localhost:5000/api/house-hold/add-member

- input:{
  "houseHoldId": "68efc1195ffbd315ee8eccf4",
  "newMemberId": "694ebc246c99312e570a4abd",
  "relationship": "Con",
  "identification": "123456789012",
  "name": "Nguyễn Văn A"
  }

- output:
  {
  "message": "Member added successfully",
  "household": {
  "id": "68efc1195ffbd315ee8eccf4",
  "identification_head": "ID3001"
  },
  "newMember": {
  "id": "694ebc246c99312e570a4abd",
  "name": "Nguyễn Văn A",
  "relationship": "Con",
  "identification": "123456789012"
  }
  }

## Tạo hóa đơn(1 loại phí nhé tí muốn thì nói cuso gộp lại thành 1 bill lớn cho)

URL:http://localhost:5000/api/bills/create-bill\

- input:{
  "identification_head": "ID2001",
  "type": "electricity",
  "oldIndex": 100,
  "newIndex": 150,
  "dueDate": "2025-12-31"
  }

- output:
  {
  "message": "Bill created successfully",
  "bill": {
  "houseHold": "68efc1195ffbd315ee8eccf3",
  "type": "electricity",
  "billItem": [
  {
  "oldIndex": 100,
  "newIndex": 150,
  "unitPrice": 3000,
  "amount": 150000,
  "dueDate": "2025-12-31T00:00:00.000Z",
  "status": false,
  "paidAt": null,
  "_id": "695142c75eace3e7a4952f9a",
  "createdAt": "2025-12-28T14:46:31.136Z"
  }
  ],
  "\_id": "695142c75eace3e7a4952f99",
  "\_\_v": 0
  }
  }

## Đọc tất cả hóa đơn của 1 hộ(user tự đọc)

URL:http://localhost:5000/api/bills/households/ID4001/bills

- input: không cần nhập kích vô là đc
- output:

```json
{
  "household": {
    "id": "68efc1195ffbd315ee8eccf5",
    "name": "Ho Pham",
    "identification_head": "ID4001"
  },
  "total": 1,
  "bills": [
    {
      "_id": "695150d55eace3e7a4952fa6",
      "houseHold": {
        "_id": "68efc1195ffbd315ee8eccf5",
        "namehousehold": "Ho Pham",
        "address": "102 Tran Phu, Hue",
        "identification_head": "ID4001"
      },
      "type": "garbage",
      "billItem": [
        {
          "oldIndex": 0,
          "newIndex": 0,
          "unitPrice": 25000,
          "amount": 25000,
          "dueDate": "2025-12-31T00:00:00.000Z",
          "status": false,
          "paidAt": null,
          "_id": "695150d55eace3e7a4952fa7",
          "createdAt": "2025-12-28T15:46:29.879Z"
        }
      ],
      "__v": 0
    }
  ]
}
```

## Đọc tất cả hóa đơn của chung cư

URL:http://localhost:5000/api/bills/get-bills

```json
- input: không cần
- output:
{
    "total": 3,
    "bills": [
        {
            "_id": "695150d55eace3e7a4952fa6",
            "houseHold": {
                "_id": "68efc1195ffbd315ee8eccf5",
                "namehousehold": "Ho Pham",
                "address": "102 Tran Phu, Hue",
                "identification_head": "ID4001"
            },
            "type": "garbage",
            "billItem": [
                {
                    "oldIndex": 0,
                    "newIndex": 0,
                    "unitPrice": 25000,
                    "amount": 25000,
                    "dueDate": "2025-12-31T00:00:00.000Z",
                    "status": false,
                    "paidAt": null,
                    "_id": "695150d55eace3e7a4952fa7",
                    "createdAt": "2025-12-28T15:46:29.879Z"
                }
            ],
            "__v": 0
        },
        {
            "_id": "695142c75eace3e7a4952f99",
            "houseHold": {
                "_id": "68efc1195ffbd315ee8eccf3",
                "namehousehold": "Ho Tran",
                "address": "45 Le Loi, Da Nang",
                "identification_head": "ID2001"
            },
            "type": "electricity",
            "billItem": [
                {
                    "oldIndex": 100,
                    "newIndex": 150,
                    "unitPrice": 3000,
                    "amount": 150000,
                    "dueDate": "2025-12-31T00:00:00.000Z",
                    "status": false,
                    "paidAt": null,
                    "_id": "695142c75eace3e7a4952f9a",
                    "createdAt": "2025-12-28T14:46:31.136Z"
                }
            ],
            "__v": 0
        },
        {
            "_id": "694e92b2ccf70a2ab8fb5e32",
            "houseHold": null,
            "type": "electricity",
            "billItem": [
                {
                    "oldIndex": 100,
                    "newIndex": 150,
                    "unitPrice": 3000,
                    "amount": 150000,
                    "dueDate": "2025-12-31T00:00:00.000Z",
                    "status": false,
                    "paidAt": null,
                    "_id": "694e92b2ccf70a2ab8fb5e33",
                    "createdAt": "2025-12-26T13:50:42.928Z"
                }
            ],
            "__v": 0
        }
    ]
}
```

## User đọc thông tin cá nhân của mình:

```json
URL:http://localhost:5000/api/user/my-profile

-input:{
"userId": "694ebc246c99312e570a4abd"
}

- output:
{
    "message": "Profile retrieved successfully",
    "user": {
        "_id": "694ebc246c99312e570a4abd",
        "identification": "001095001234",
        "name": "Nguyễn Văn A",
        "phone": "0912345611",
        "address": "Số 123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        "dob": "1995-10-25T00:00:00.000Z"
    }
}
```

## update trạng thái hóa đơn

```json
URL:http://localhost:5000/api/bills/update-bill-item/694e92b2ccf70a2ab8fb5e32/694e92b2ccf70a2ab8fb5e33

- input:{
  "status": true
  }

- output:
{
    "message": "Bill item status updated successfully",
    "bill": {
        "_id": "694e92b2ccf70a2ab8fb5e32",
        "houseHold": null,
        "type": "electricity",
        "billItem": [
            {
                "oldIndex": 100,
                "newIndex": 150,
                "unitPrice": 3000,
                "amount": 150000,
                "dueDate": "2025-12-31T00:00:00.000Z",
                "status": true,
                "paidAt": "2025-12-29T01:38:21.378Z",
                "_id": "694e92b2ccf70a2ab8fb5e33",
                "createdAt": "2025-12-26T13:50:42.928Z"
            }
        ],
        "__v": 0
    }
}
```

## Thống kê tổng số hộ

```JSON
URL: http://localhost:5000/api/house-hold/statistics

- input: k cần
- output:
{
    "message": "Total households retrieved successfully",
    "totalHouseholds": 6
}
```

## Tổng tiền đã thanh toán trong tháng

```json
URL:http://localhost:5000/api/bills/revenue/specific-month?year=2025&month=12

- output:{
    "message": "Revenue for 12/2025 calculated successfully",
    "period": {
        "year": 2025,
        "month": 12
    },
    "summary": {
        "totalRevenue": 150000,
        "totalBills": 1
    },
    "breakdown": [
        {
            "type": "electricity",
            "totalAmount": 150000,
            "count": 1
        }
    ]
}
```

## Thống kê các hộ chưa nộp tiền theo tháng

```json
URL:http://localhost:5000/api/bills/count-unpaid-households?year=2025&month=12

- output:
{"message":"Count retrieved successfully","period":{"year":2025,"month":12},"totalHouseholdsWithUnpaidBills":2}
```

/_
curl -X POST http://localhost:5000/api/posts/posts \
 -F "title=Test bài viết" \
 -F "content=Nội dung test upload ảnh với Multer" \
 -F "isPinned=false" \
 -F "![alt text](478458551_1154089796351860_8528934147318576681_n.jpg)"
_/ (này không quan trọng lắm đâu,đừng động vào)

## Post kèm ảnh upload từ admin

```json
URL:http://localhost:5000/api/posts/posts

- install thư viện: npm install multer
- input: tại postman chọn body-> from-data
  điền: ### Body (form-data)

| Key      | Type | Value                                      |
| -------- | ---- | ------------------------------------------ |
| title    | Text | Bài viết về Node.js                        |
| content  | Text | Hướng dẫn upload file với Multer           |
| isPinned | Text | true                                       |
| image    | File | (Chọn file ảnh từ máy, ví dụ: \*.jpg/.png) |

- output:
  {
  "title": "Bài viết về Node.js",
  "content": "Hướng dẫn upload file với Multer",
  "imageUrl": "/uploads/images/1767054181352-651813545.jpg",
  "isPinned": true,
  "\_id": "69531b65f4a31106efcdf672",
  "createdAt": "2025-12-30T00:23:01.645Z",
  "updatedAt": "2025-12-30T00:23:01.645Z",
  "\_\_v": 0
  }

- test xem ảnh :http://localhost:5000/uploads/images/1767054181352-651813545.jpg
```

## User đọc thông tin hóa đon của nhà

```json
URL:http://localhost:5000/api/bills/user/694ea34af0c22a1507083dce/bills
Phương thức GET kiểu req.params
output:{
"message": "Bills retrieved successfully",
"household": {
"id": "694ea34af0c22a1507083dce",
"name": "Chung cu A - Tang 5 - Phong 101",
"address": "Số 12, Nguyễn Trãi, Thanh Xuân, Hà Nội",
"namehead": "Pham Van D"
},
"total": 0,
"bills": []
}
```
