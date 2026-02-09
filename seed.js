require("dotenv").config();
const connectDB = require("./app/config/db.config");
const Course = require("./app/models/course.model");

const seedCourses = async () => {
  const courses = [
    {
      title: "Intro to Web Development",
      description: "HTML, CSS, and JavaScript fundamentals with hands-on tasks.",
      content:
        "Learn the full web basics from structure to interactivity and ship a real landing page.",
      status: true,
      dueDate: new Date("2026-03-15"),
      modules: [
        {
          title: "HTML Foundations",
          summary: "Semantic structure, forms, and accessible markup.",
          task: "Build a 3-section landing page using semantic tags."
        },
        {
          title: "CSS Layout",
          summary: "Flexbox, Grid, spacing systems, and responsive patterns.",
          task: "Make the landing page responsive for mobile and desktop."
        },
        {
          title: "JavaScript Basics",
          summary: "Variables, functions, DOM selection, and events.",
          task: "Add interactive FAQ toggle and a newsletter form validation."
        }
      ]
    },
    {
      title: "Node.js API Mastery",
      description: "Build REST APIs with Express, JWT auth, and MongoDB.",
      content:
        "Design robust APIs with authentication, validation, and deployment.",
      status: true,
      dueDate: new Date("2026-04-01"),
      modules: [
        {
          title: "Express Essentials",
          summary: "Routing, middleware, and API structure.",
          task: "Create a CRUD API with 3 endpoints."
        },
        {
          title: "Authentication",
          summary: "JWT, bcrypt, and protected routes.",
          task: "Add register/login and protect a private endpoint."
        },
        {
          title: "MongoDB",
          summary: "Schema design and validation with Mongoose.",
          task: "Implement models and add Joi validation."
        },
        {
          title: "Deployment",
          summary: "Environment variables and hosting.",
          task: "Deploy the API to Railway/Render and document it."
        }
      ]
    },
    {
      title: "Frontend UI Engineering",
      description: "Design responsive layouts and modern UI systems.",
      content:
        "Craft modern interfaces with strong typography and responsive grids.",
      status: true,
      dueDate: new Date("2026-03-25"),
      modules: [
        {
          title: "Design Systems",
          summary: "Color, type scale, and spacing tokens.",
          task: "Define tokens and apply them to a UI kit."
        },
        {
          title: "Responsive Layouts",
          summary: "Grid, Flexbox, and adaptive breakpoints.",
          task: "Build a dashboard layout that works on mobile and desktop."
        },
        {
          title: "Component Patterns",
          summary: "Reusable components and structure.",
          task: "Create 4 reusable UI components (card, button, modal, list)."
        }
      ]
    },
    {
      title: "Database Essentials",
      description: "Schema design, indexing, and data modeling with MongoDB.",
      content:
        "Learn how to model data for performance and scale.",
      status: true,
      dueDate: new Date("2026-04-10"),
      modules: [
        {
          title: "Schema Design",
          summary: "Normalization vs denormalization.",
          task: "Design a schema for an e-commerce catalog."
        },
        {
          title: "Indexing",
          summary: "Performance and query optimization.",
          task: "Add indexes and measure query performance."
        },
        {
          title: "Modeling Relationships",
          summary: "Embedding vs referencing.",
          task: "Model users and orders with the right strategy."
        }
      ]
    },
    {
      title: "Secure Authentication",
      description: "JWT, password hashing, and role-based access control.",
      content:
        "Harden APIs with secure auth and roles.",
      status: true,
      dueDate: new Date("2026-03-20"),
      modules: [
        {
          title: "Password Security",
          summary: "Hashing strategies and salts.",
          task: "Implement bcrypt hashing and verify login."
        },
        {
          title: "JWT Lifecycle",
          summary: "Tokens, expiration, and refresh patterns.",
          task: "Generate JWTs with expirations and verify protected routes."
        },
        {
          title: "Role-Based Access",
          summary: "Permissions and role enforcement.",
          task: "Add admin/moderator/user role policies to routes."
        }
      ]
    }
  ];

  for (const course of courses) {
    await Course.updateOne(
      { title: course.title },
      {
        $set: {
          description: course.description,
          content: course.content,
          status: course.status,
          dueDate: course.dueDate,
          modules: course.modules
        },
        $setOnInsert: { title: course.title }
      },
      { upsert: true }
    );
  }
};

connectDB()
  .then(async () => {
    await seedCourses();
    console.log("Courses seeded");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed", err.message);
    process.exit(1);
  });