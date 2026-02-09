module.exports = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  user: process.env.MAIL_USER || "",
  pass: process.env.MAIL_PASS || "",
  from: process.env.MAIL_FROM || "no-reply@online-courses.local"
};