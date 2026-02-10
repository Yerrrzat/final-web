# Online Courses Website

Online Courses platform with JWT authentication, RBAC, course management, and enrollments. Built with Node.js, Express, and MongoDB.

## Project overview

- Secure registration/login with JWT
- Role-based access: admin, moderator, premium, user
- Course catalog + enrollment tracking
- SMTP email notifications (optional)
- Separate pages for Home, Auth, Courses, Profile, Admin

## Setup

1. Install dependencies:

```
npm install
```

2. Start MongoDB locally, then run:

```
npm run dev
```

Open http://localhost:5000

## Seed courses

```
npm run seed
```


## API Documentation

Auth (Public)
- POST `/register`
- POST `/login`

User Profile (Private)
- GET `/users/profile`
- PUT `/users/profile`

Course Resource (Private)
- POST `/resource` (admin, moderator)
- GET `/resource`
- GET `/resource/:id`
- PUT `/resource/:id` (admin, moderator)
- DELETE `/resource/:id` (admin)

Course Catalog (Public)
- GET `/resource/public`

Enrollment (Private)
- POST `/enroll/:courseId`
- GET `/my-courses`
- PUT `/my-courses/:courseId/modules`

## Screenshots

Home page — Landing and status

![](docs/screenshots/home.png)

Auth page — Registration and login

![](docs/screenshots/auth.png)

Courses page — Course catalog

![](docs/screenshots/courses.png)

Profile page — Profile and enrolled courses

![](docs/screenshots/profile.png)

Admin page — Course management

![](docs/screenshots/admin.png)


Deployed URL: https://final-web-68up.onrender.com
GitHub Repo: https://github.com/Yerrrzat/final-web
