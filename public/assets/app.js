const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null")
};

const getEl = (id) => document.getElementById(id);

const coursesGrid = getEl("coursesGrid");
const myCoursesList = getEl("myCoursesList");
const healthStatus = getEl("healthStatus");
const totalCourses = getEl("totalCourses");
const totalEnrollments = getEl("totalEnrollments");
const logoutBtn = getEl("logoutBtn");
const accountRole = getEl("accountRole");
const headerRole = getEl("headerRole");
const loginLink = getEl("loginLink");
const courseDetail = getEl("courseDetail");
const courseDetailTitle = getEl("courseDetailTitle");
const courseDetailContent = getEl("courseDetailContent");
const filterStatus = getEl("filterStatus");
const filterDue = getEl("filterDue");
const courseModules = getEl("courseModules");
const courseProgressFill = getEl("courseProgressFill");
const courseProgressValue = getEl("courseProgressValue");
const courseProgressStatus = getEl("courseProgressStatus");
const nextModule = getEl("nextModule");
const certificate = getEl("certificate");
const certificateText = getEl("certificateText");
const moduleTitle = getEl("moduleTitle");
const moduleSummary = getEl("moduleSummary");
const moduleTask = getEl("moduleTask");
const moduleComplete = getEl("moduleComplete");
const moduleStatus = getEl("moduleStatus");
const backToCourse = getEl("backToCourse");
const moduleSubmission = getEl("moduleSubmission");

const enrolledIds = new Set();
let cachedCourses = [];

const registerForm = getEl("registerForm");
const loginForm = getEl("loginForm");
const profileForm = getEl("profileForm");
const courseForm = getEl("courseForm");

const registerMessage = getEl("registerMessage");
const loginMessage = getEl("loginMessage");
const profileMessage = getEl("profileMessage");
const courseMessage = getEl("courseMessage");

const authHeaders = () =>
  state.token
    ? {
        Authorization: `Bearer ${state.token}`
      }
    : {};

const setAuth = (token, user) => {
  state.token = token;
  state.user = user;
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const role = user?.role ? user.role : "guest";

  if (accountRole) {
    accountRole.textContent = role;
  }

  if (headerRole) {
    headerRole.textContent = role;
    headerRole.classList.remove("hidden", "admin", "moderator", "premium", "user");
    if (role === "guest") {
      headerRole.classList.add("hidden");
    } else {
      headerRole.classList.add(role);
    }
  }

  if (loginLink) {
    loginLink.classList.toggle("hidden", role !== "guest");
  }
};

const showMessage = (el, message, isError = false) => {
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#cf4621" : "#6e6a65";
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const loadHealth = async () => {
  if (!healthStatus) return;
  try {
    const data = await fetchJSON(`/health`);
    healthStatus.textContent = `Online (${new Date(data.timestamp).toLocaleString()})`;
  } catch (err) {
    healthStatus.textContent = "API offline";
  }
};

const loadCourses = async () => {
  if (!coursesGrid) return;
  coursesGrid.innerHTML = "";
  try {
    cachedCourses = await fetchJSON(`/resource/public`);
    renderCourses();
  } catch (err) {
    const message =
      err.message === "Unauthorized" || err.message === "No token provided"
        ? "Please log in to view available courses."
        : err.message;
    coursesGrid.innerHTML = `<p>${message}</p>`;
  }
};

const renderCourses = () => {
  if (!coursesGrid) return;
  coursesGrid.innerHTML = "";
  const courses = applyFilters(cachedCourses);
  if (totalCourses) totalCourses.textContent = courses.length;

  courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course";
      const isEnrolled = enrolledIds.has(course._id);
      card.innerHTML = `
        <div class="title">${course.title}</div>
        <div class="meta">${course.description}</div>
        <div class="meta">Status: ${course.status ? "Active" : "Paused"}</div>
        <div class="meta">Due: ${course.dueDate ? new Date(course.dueDate).toLocaleDateString() : "N/A"}</div>
        <div class="course-actions">
          <button class="primary enroll-btn" type="button" ${isEnrolled ? "disabled" : ""}>
            ${isEnrolled ? "Enrolled" : "Enroll"}
          </button>
          <a class="ghost content-btn" href="/course/${course._id}">View content</a>
        </div>
      `;

      const enrollBtn = card.querySelector(".enroll-btn");
      if (!isEnrolled) {
        enrollBtn.addEventListener("click", () => enroll(course._id));
      }
      coursesGrid.appendChild(card);
  });
};

const applyFilters = (courses) => {
  let result = [...courses];

  if (filterStatus && filterStatus.value !== "all") {
    const active = filterStatus.value === "active";
    result = result.filter((course) => Boolean(course.status) === active);
  }

  if (filterDue && filterDue.value !== "all") {
    const now = new Date();
    if (filterDue.value === "soon") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + 30);
      result = result.filter((course) => {
        if (!course.dueDate) return false;
        const due = new Date(course.dueDate);
        return due >= now && due <= cutoff;
      });
    } else if (filterDue.value === "past") {
      result = result.filter((course) => {
        if (!course.dueDate) return false;
        return new Date(course.dueDate) < now;
      });
    }
  }

  return result;
};

const viewContent = async (courseId) => {
  if (!state.token) {
    alert("Please log in to view course content.");
    return;
  }

  try {
    const [course, enrollments] = await Promise.all([
      fetchJSON(`/resource/${courseId}`, { headers: authHeaders() }),
      fetchJSON(`/my-courses`, { headers: authHeaders() })
    ]);
    const enrollment = enrollments.find((item) => item.course._id === courseId);
    const completedModules = new Set(enrollment?.completedModules || []);
    if (courseDetailTitle) courseDetailTitle.textContent = course.title;
    if (courseDetailContent) {
      const content =
        course.content && course.content.trim().length > 0
          ? course.content
          : "No content available yet.";
      courseDetailContent.innerHTML = content
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join("");
    }
    if (courseModules) {
      courseModules.innerHTML = "";
      if (Array.isArray(course.modules) && course.modules.length > 0) {
        course.modules.forEach((mod, index) => {
          const isDone = completedModules.has(index);
          const item = document.createElement("div");
          item.className = "module";
          item.innerHTML = `
            <div class="module-header">
              <span>${mod.title}</span>
            </div>
            <p class="meta">${mod.summary || ""}</p>
            <p>${mod.task || ""}</p>
            <div class="module-actions">
              <span class="meta">${isDone ? "Completed" : "Not completed"}</span>
              <a class="ghost" href="/course/${courseId}/module/${index}">Open module</a>
            </div>
          `;
          courseModules.appendChild(item);
        });
        updateProgressUI(course.modules, completedModules);
      } else {
        courseModules.innerHTML = "<p>No modules available.</p>";
      }
    }
    if (courseDetail) {
      courseDetail.classList.remove("hidden");
      courseDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    alert(err.message);
  }
};

const updateProgressUI = (modules, completedSet) => {
  if (!modules || modules.length === 0) return;
  const completedCount = completedSet.size;
  const progress = Math.round((completedCount / modules.length) * 100);
  if (courseProgressFill) courseProgressFill.style.width = `${progress}%`;
  if (courseProgressValue) courseProgressValue.textContent = `${progress}%`;
  if (courseProgressStatus) {
    courseProgressStatus.textContent = progress === 100 ? "Complete" : "In progress";
  }
  if (nextModule) {
    const nextIndex = modules.findIndex((_, idx) => !completedSet.has(idx));
    if (nextIndex === -1) {
      nextModule.textContent = "Next module: All modules completed.";
    } else {
      nextModule.textContent = `Next module: ${modules[nextIndex].title}`;
    }
  }
  if (certificate) {
    const show = progress === 100;
    certificate.classList.toggle("hidden", !show);
    if (show && certificateText) {
      const name = state.user?.username || "Student";
      const title = courseDetailTitle?.textContent || "this course";
      certificateText.textContent = `${name} has successfully completed ${title}.`;
    }
  }
};

const enroll = async (courseId) => {
  if (!state.token) {
    alert("Please log in to enroll.");
    return;
  }

  try {
    await fetchJSON(`/enroll/${courseId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      }
    });

    await loadMyCourses();
  } catch (err) {
    alert(err.message);
  }
};

const loadMyCourses = async () => {
  if (!myCoursesList) return;
  myCoursesList.innerHTML = "";
  if (!state.token) {
    if (totalEnrollments) totalEnrollments.textContent = "0";
    return;
  }

  try {
    const courses = await fetchJSON(`/my-courses`, {
      headers: authHeaders()
    });

    enrolledIds.clear();
    if (totalEnrollments) totalEnrollments.textContent = courses.length;
    courses.forEach((item) => {
      const course = item.course;
      const progress = item.progress ?? 0;
      enrolledIds.add(course._id);
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="course-row">
          <span>${course.title}</span>
          <div class="progress-controls">
            <input class="progress-range" type="range" min="0" max="100" value="${progress}" />
            <span class="meta progress-value">${progress}%</span>
          </div>
        </div>
      `;
      const range = li.querySelector(".progress-range");
      const valueEl = li.querySelector(".progress-value");
      range.addEventListener("input", () => {
        valueEl.textContent = `${range.value}%`;
      });
      myCoursesList.appendChild(li);
    });
    renderCourses();
  } catch (err) {
    myCoursesList.innerHTML = `<li>${err.message}</li>`;
  }
};

const updateProgress = async () => {};
const scheduleProgressUpdate = () => {};

const updateModuleProgress = async (courseId, moduleIndex, completed) => {
  try {
    await fetchJSON(`/my-courses/${courseId}/modules`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ moduleIndex, completed })
    });
    await loadMyCourses();
  } catch (err) {
    alert(err.message);
  }
};

const loadModulePage = async (courseId, moduleIndex) => {
  if (!state.token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const [course, enrollments] = await Promise.all([
      fetchJSON(`/resource/${courseId}`, { headers: authHeaders() }),
      fetchJSON(`/my-courses`, { headers: authHeaders() })
    ]);
    const enrollment = enrollments.find((item) => item.course._id === courseId);
    if (!enrollment) {
      if (moduleStatus) moduleStatus.textContent = "Enroll in the course first.";
      return;
    }

    if (!Array.isArray(course.modules) || course.modules.length === 0) {
      if (moduleStatus) moduleStatus.textContent = "No modules available.";
      return;
    }

    if (moduleIndex < 0 || moduleIndex >= course.modules.length) {
      if (moduleStatus) moduleStatus.textContent = "Invalid module.";
      return;
    }

    const completed = new Set(enrollment.completedModules || []);
    const nextIndex = course.modules.findIndex((_, idx) => !completed.has(idx));
    const isUnlocked = nextIndex === -1 || moduleIndex <= nextIndex;

    const mod = course.modules[moduleIndex];
    if (moduleTitle) moduleTitle.textContent = mod.title;
    if (moduleSummary) moduleSummary.textContent = mod.summary || "";
    if (moduleTask) moduleTask.textContent = mod.task || "";
    if (backToCourse) backToCourse.href = `/course/${courseId}`;

    const completedNow = completed.has(moduleIndex);
    if (moduleSubmission) {
      moduleSubmission.value = completedNow ? "Submitted" : "";
      moduleSubmission.disabled = !isUnlocked;
    }

    if (moduleComplete) {
      moduleComplete.checked = completedNow;
      moduleComplete.disabled = !isUnlocked;
      moduleComplete.addEventListener("change", async () => {
        if (moduleComplete.checked) {
          const hasText = moduleSubmission && moduleSubmission.value.trim().length > 0;
          if (!hasText) {
            moduleComplete.checked = false;
            alert("Please submit your task link/notes before completing.");
            return;
          }
        }
        await updateModuleProgress(courseId, moduleIndex, moduleComplete.checked);
        if (moduleComplete.checked) {
          const updated = await fetchJSON(`/my-courses`, { headers: authHeaders() });
          const updatedEnrollment = updated.find((item) => item.course._id === courseId);
          const doneSet = new Set(updatedEnrollment?.completedModules || []);
          const nextIndex = course.modules.findIndex((_, idx) => !doneSet.has(idx));
          if (nextIndex !== -1) {
            window.location.href = `/course/${courseId}/module/${nextIndex}`;
          } else {
            window.location.href = `/course/${courseId}`;
          }
        } else {
          await loadModulePage(courseId, moduleIndex);
        }
      });
    }

    if (moduleStatus) {
      if (!isUnlocked) {
        moduleStatus.textContent = "Complete previous module to unlock this one.";
      } else if (moduleComplete?.checked) {
        moduleStatus.textContent = "Module completed.";
      } else {
        moduleStatus.textContent = "Mark the task as completed when done.";
      }
    }
  } catch (err) {
    alert(err.message);
  }
};

const loadProfile = async () => {
  if (!profileForm || !state.token) return;
  try {
    const user = await fetchJSON(`/users/profile`, {
      headers: authHeaders()
    });
    profileForm.username.value = user.username || "";
    profileForm.email.value = user.email || "";
    setAuth(state.token, user);
  } catch (err) {
    showMessage(profileMessage, err.message, true);
  }
};

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      await fetchJSON(`/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      showMessage(registerMessage, "Registration successful. Please log in.");
      registerForm.reset();
    } catch (err) {
      showMessage(registerMessage, err.message, true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const data = await fetchJSON(`/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setAuth(data.token, data.user);
      showMessage(loginMessage, "Login successful.");
      loginForm.reset();
      await loadMyCourses();
      await loadProfile();
      if (document.body?.dataset.page === "auth") {
        window.location.href = "/profile";
      }
    } catch (err) {
      showMessage(loginMessage, err.message, true);
    }
  });
}

if (loginMessage && localStorage.getItem("adminDenied") === "1") {
  localStorage.removeItem("adminDenied");
  showMessage(loginMessage, "Access denied: admin only.", true);
}

if (profileForm) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.token) {
      showMessage(profileMessage, "Please log in first.", true);
      return;
    }

    const formData = new FormData(profileForm);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.password) delete payload.password;

    try {
      const user = await fetchJSON(`/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      setAuth(state.token, user);
      showMessage(profileMessage, "Profile updated.");
    } catch (err) {
      showMessage(profileMessage, err.message, true);
    }
  });
}

if (courseForm) {
  courseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.token) return;

    const formData = new FormData(courseForm);
    const payload = Object.fromEntries(formData.entries());
    payload.status = formData.get("status") === "on";

    try {
      await fetchJSON(`/resource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      showMessage(courseMessage, "Course created.");
      courseForm.reset();
      await loadCourses();
    } catch (err) {
      showMessage(courseMessage, err.message, true);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    setAuth("", null);
    loadMyCourses();
    showMessage(loginMessage, "Logged out.");
    window.location.href = "/";
  });
}

const init = async () => {
  setAuth(state.token, state.user);
  await loadHealth();
  await loadMyCourses();
  await loadCourses();
  await loadProfile();

  if (document.body?.dataset.page === "admin") {
    const role = state.user?.role || "guest";
    if (role !== "admin") {
      localStorage.setItem("adminDenied", "1");
      window.location.href = "/auth";
    }
  }

  if (document.body?.dataset.page === "course-detail") {
    const courseId = window.location.pathname.split("/course/")[1];
    if (courseId) {
      await viewContent(courseId);
    }
  }

  if (document.body?.dataset.page === "module-detail") {
    const parts = window.location.pathname.split("/course/")[1]?.split("/module/");
    const courseId = parts?.[0];
    const moduleIndex = Number(parts?.[1]);
    if (courseId && Number.isInteger(moduleIndex)) {
      await loadModulePage(courseId, moduleIndex);
    }
  }

  if (filterStatus) filterStatus.addEventListener("change", renderCourses);
  if (filterDue) filterDue.addEventListener("change", renderCourses);
};

init();
