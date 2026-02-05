# Microservice Architecture for Real-Time Chat Application using Event-Driven and gRPC

## 👥 Thành viên nhóm

| STT | Mã sinh viên | Họ và tên           |
| :-: | :----------: | :------------------ |
|  1  |  `23010310`  | `Nguyễn Hà Nguyên`  |
|  2  | `23010298 `  | `Hoàng Lê Đức Huy ` |
|  3  | `23010302 `  | `Nguyễn Đức Minh `  |

---

## 📚 Tài liệu

| Tài liệu                                                                                          | Mô tả         |
| :------------------------------------------------------------------------------------------------ | :------------ |
| [Tài liệu api](documents/api/app%20chat%20realtime%20with%20microservice.postman_collection.json) | Tài liệu api  |
| [Lab Report 1](documents/Class%20N02_Group%208_Lab%20report%201.pdf)                              | Báo cáo Lab 1 |
| [Lab Report 2](documents/Class%20N02_Group%208_Lab%20report%202.pdf)                              | Báo cáo Lab 2 |
| [Lab Report 4](documents/Class%20N02_Group%208_Lab%20report%204.pdf)                              | Báo cáo Lab 4 |
| [Lab Report 8](documents/Class%20N02_Group%208_Lab%20report%208.pdf)                              | Báo cáo Lab 8 |
| [Project Report](<documents/project%20report%20(tieng%20anh).pdf>)                                | Báo cáo       |

---

## 📖 Mô tả dự án

### Tổng quan

Đây là một ứng dụng **Chat Real-Time** được xây dựng theo kiến trúc **Microservices**, sử dụng **Event-Driven Architecture** và **gRPC** để giao tiếp giữa các services. Ứng dụng hỗ trợ nhắn tin thời gian thực, quản lý bạn bè, thông báo và nhiều tính năng khác.

### 🛠️ Công nghệ sử dụng

#### Backend (NestJS Monorepo)

| Công nghệ         | Mô tả                                                |
| :---------------- | :--------------------------------------------------- |
| **NestJS**        | Framework Node.js cho backend microservices          |
| **gRPC**          | Protocol Buffer cho giao tiếp giữa các microservices |
| **RabbitMQ**      | Message broker cho Event-Driven Architecture         |
| **Socket.IO**     | WebSocket cho real-time communication                |
| **Prisma**        | ORM cho MongoDB                                      |
| **MongoDB**       | NoSQL database lưu trữ dữ liệu                       |
| **Redis**         | Caching và quản lý user session/online status        |
| **JWT**           | Authentication và Authorization                      |
| **Cloudflare R2** | Object storage cho lưu trữ file/avatar               |
| **Winston**       | Logging system                                       |
| **Nodemailer**    | Gửi email thông báo                                  |

#### Frontend (React + Vite)

| Công nghệ                 | Mô tả                       |
| :------------------------ | :-------------------------- |
| **React 19**              | UI Library                  |
| **Vite**                  | Build tool và dev server    |
| **TypeScript**            | Type-safe JavaScript        |
| **Redux Toolkit**         | State management            |
| **Socket.IO Client**      | WebSocket client            |
| **TailwindCSS**           | Utility-first CSS framework |
| **Radix UI**              | Headless UI components      |
| **React Hook Form + Zod** | Form handling và validation |
| **React Three Fiber**     | 3D animations               |

### 📦 Các Microservices

#### 1. API Gateway

- Entry point cho tất cả HTTP requests
- Routing requests đến các microservices qua gRPC
- Authentication/Authorization với JWT
- Rate Limiting

#### 2. User Service

- Đăng ký, đăng nhập người dùng
- Quản lý profile (cập nhật thông tin, avatar)
- Hệ thống kết bạn (gửi lời mời, chấp nhận/từ chối)
- Danh sách bạn bè

#### 3. Chat Service

- Tạo cuộc hội thoại (Direct Message / Group Chat)
- Gửi và nhận tin nhắn
- Reply tin nhắn
- Đánh dấu đã đọc
- Thêm thành viên vào nhóm

#### 4. Notification Service

- Tạo và quản lý thông báo
- Thông báo lời mời kết bạn
- Thông báo chấp nhận kết bạn

#### 5. Realtime Gateway

- WebSocket server với Socket.IO
- Quản lý user online/offline status
- Broadcast events real-time (tin nhắn mới, thông báo, cuộc trò chuyện mới)
- Subscribe RabbitMQ events

### 🗄️ Database Schema (MongoDB với Prisma)

- **User**: Thông tin người dùng (email, username, password, avatar, bio)
- **Friendship**: Quan hệ bạn bè giữa các user
- **FriendRequest**: Lời mời kết bạn (pending, accepted, rejected)
- **Notification**: Thông báo cho user
- **Conversation**: Cuộc hội thoại (Direct hoặc Group)
- **ConversationMember**: Thành viên trong cuộc hội thoại
- **Message**: Tin nhắn trong cuộc hội thoại

### 🔄 Event-Driven Communication

#### RabbitMQ Exchanges

- `chat.events`: Events liên quan đến chat
- `user.events`: Events liên quan đến user
- `notification.events`: Events liên quan đến notification

#### Routing Keys

- `user.created`, `user.makeFriend`, `user.updateStatusMakeFriend`, `user.updated`
- `conversation.created`, `message.sent`, `member.addedToConversation`
- `notification.created`

### ⚡ WebSocket Events

| Event                           | Mô tả                    |
| :------------------------------ | :----------------------- |
| `user_online`                   | User kết nối             |
| `user_offline`                  | User ngắt kết nối        |
| `chat.new_message`              | Tin nhắn mới             |
| `chat.new_conversation`         | Cuộc trò chuyện mới      |
| `chat.new_member_added`         | Thành viên mới được thêm |
| `notification.new_notification` | Thông báo mới            |

### 🚀 Chạy dự án

#### Prerequisites

- Node.js >= 18
- MongoDB
- Redis
- RabbitMQ
- Protobuf compiler (protoc)

#### Backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev api-gateway    # API Gateway
npm run start:dev user           # User Service
npm run start:dev chat           # Chat Service
npm run start:dev notification   # Notification Service
npm run start:dev realtime-gateway  # Realtime Gateway
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Hoặc chạy tất cả với VS Code Tasks

Sử dụng task `start-all` trong VS Code để khởi động toàn bộ services.

### 📁 Cấu trúc thư mục

```
chat-real-time/
├── backend/                    # NestJS Monorepo
│   ├── apps/                   # Microservices
│   │   ├── api-gateway/        # HTTP API Gateway
│   │   ├── user/               # User Service (gRPC)
│   │   ├── chat/               # Chat Service (gRPC)
│   │   ├── notification/       # Notification Service (gRPC)
│   │   └── realtime-gateway/   # WebSocket Gateway
│   ├── libs/                   # Shared Libraries
│   │   ├── common/             # Common utilities, guards
│   │   ├── constant/           # Constants (gRPC, RMQ, WebSocket)
│   │   ├── logger/             # Winston logger
│   │   ├── mailer/             # Email service
│   │   ├── prisma/             # Prisma client & schema
│   │   ├── redis/              # Redis client
│   │   ├── storage-r2/         # Cloudflare R2 storage
│   │   └── util/               # Utility functions
│   ├── interfaces/             # Generated gRPC TypeScript interfaces
│   └── proto/                  # Protocol Buffer definitions
├── frontend/                   # React + Vite Application
│   └── src/
│       ├── components/         # UI Components
│       ├── pages/              # Page components
│       ├── redux/              # Redux store & slices
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Utilities (socket, utils)
├── documents/                  # Project reports
└── testing/                    # Test scripts (k6)
```

### ✨ Tính năng chính

- ✅ Đăng ký, đăng nhập với JWT Authentication
- ✅ Nhắn tin real-time (1-1 và nhóm)
- ✅ Reply tin nhắn
- ✅ Thông báo real-time
- ✅ Hệ thống kết bạn (gửi/chấp nhận/từ chối lời mời)
- ✅ Quản lý profile (avatar, bio, fullName)
- ✅ Trạng thái online/offline
- ✅ Đánh dấu tin nhắn đã đọc
- ✅ Tạo nhóm chat
- ✅ Theme sáng/tối
- ✅ Rate limiting
- ✅ Logging system
