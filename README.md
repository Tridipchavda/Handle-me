# 📝 Handle-Me

**Handle-Me** is a modern productivity web application that helps you organize your **events**, **tasks**, and **journals**—all in one clean interface. Built using Next.js, PostgreSQL, and Tailwind CSS, it's designed for a smooth and thoughtful user experience.

---

## ✨ Features

- ✅ **Journals**  
  - Write daily reflections or notes.
  - Auto-save entries by date.
  - Drag & drop image support.
  - Clean, distraction-free editor.

- 📅 **Events**  
  - Schedule events with start/end time.
  - View upcoming events easily.
  - Optional reminders and statuses.

- 📋 **Tasks**  
  - Create to-do lists or projects.
  - Mark tasks as complete.
  - Categorize or group tasks.

- 🔐 **Authentication**
  - Secure JWT-based login system.
  - Route protection for user data.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: API Routes with Edge & Serverless compatibility
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Auth**: JWT with cookie-based sessions
- **Image Handling**: Client-side base64 drag-and-drop

---

## 🛠️ Installation

```bash
git clone https://github.com/your-username/handle-me.git
cd handle-me
npm install
```

## 📦 Environment Variables

- Create a **.env.local** file and configure:

```
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your_jwt_secret
NODE_ENV=production
EMAIL_USER=your@email.com
EMAIL_PASS="NOT ACTUAL PASSWORD, app code provided by google"
```

## 🚀 Run Project 🚀

- Run Next Application:
  
```bash
npm run dev
```
- Run the BullMQ Worker for sending mails on events

```bash
npm run worker
``` 

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/6ee870dd-7dd9-4eef-b8ed-d0980be7e350)
![image](https://github.com/user-attachments/assets/0d1c75c5-4c7a-4b8e-9cf6-d0fbd8e46d73)
![image](https://github.com/user-attachments/assets/9cb4bcc2-afd8-4542-8ee9-5a73015067be)
![image](https://github.com/user-attachments/assets/a23bd5a3-390e-47df-a6d5-167d7de85860)






