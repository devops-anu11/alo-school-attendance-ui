/**
 * Daily Task data layer.
 *
 * Talks to /api/daily-task. The server returns tasks with populated
 * `subjectId` / `hourId` objects, capitalised statuses and a `notes`
 * field; everything below translates between that and the flat shape the
 * components use.
 */

import {
  getDailyTasks as apiGetDailyTasks,
  createDailyTask as apiCreateDailyTask,
  updateDailyTask as apiUpdateDailyTask,
  deleteDailyTask as apiDeleteDailyTask,
  getDailyTaskHours as apiGetDailyTaskHours,
  getDailyTaskSubjects as apiGetDailyTaskSubjects,
  getDailyTaskTrainers as apiGetDailyTaskTrainers,
} from "../api/serviceapi";

/* Internal status slugs — safe for CSS class names. */
export const STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

export const STATUS_LABEL = {
  [STATUS.PENDING]: "Pending",
  [STATUS.IN_PROGRESS]: "In Progress",
  [STATUS.COMPLETED]: "Completed",
};

/** "In Progress" → "in-progress" */
const fromApiStatus = (value) => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return Object.values(STATUS).includes(slug) ? slug : STATUS.PENDING;
};

/** "in-progress" → "In Progress" (what the API stores) */
const toApiStatus = (slug) => STATUS_LABEL[slug] || STATUS_LABEL[STATUS.PENDING];

/** YYYY-MM-DD in the user's local timezone (toISOString would shift the day). */
export const toDateKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const formatDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ------------------------------------------------------------------ */
/* Dropdown options                                                    */
/* ------------------------------------------------------------------ */

/** Used only when the API is unreachable, so the form still works. */
export const FALLBACK_HOURS = [
  "09:00 - 09:45 AM",
  "09:45 - 10:30 AM",
  "11:00 - 11:45 AM",
  "11:45 - 12:30 PM",
  "01:30 - 02:15 PM",
  "02:15 - 03:00 PM",
].map((label) => ({ id: label, label }));

export const FALLBACK_SUBJECTS = [
  "UI/UX Design",
  "Graphic Design",
  "Web Development",
  "Digital Marketing",
  "Content Writing",
].map((name) => ({ id: name, label: name }));

/**
 * Subjects expose their text as `name`, hour slots as `label`, so accept
 * either (plus the usual alternatives). Trainers may only carry a split
 * first/last name, hence the final join.
 */
const normaliseOptions = (response) => {
  const raw = response?.data?.data;
  const list = Array.isArray(raw) ? raw : raw?.data;
  if (!Array.isArray(list)) return [];

  return list
    .filter((item) => item && !item.deleted)
    .map((item) => {
      const label =
        item.name ??
        item.label ??
        item.hour ??
        item.title ??
        item.trainerName ??
        [item.firstName, item.lastName].filter(Boolean).join(" ");
      return { id: item._id || item.id || String(label), label: String(label) };
    })
    .filter((o) => o.label);
};

export const fetchHourOptions = async () => {
  try {
    const options = normaliseOptions(await apiGetDailyTaskHours());
    return options.length ? options : FALLBACK_HOURS;
  } catch (err) {
    console.error("Could not load hour options:", err.message);
    return FALLBACK_HOURS;
  }
};

export const fetchSubjectOptions = async () => {
  try {
    const options = normaliseOptions(await apiGetDailyTaskSubjects());
    return options.length ? options : FALLBACK_SUBJECTS;
  } catch (err) {
    console.error("Could not load subject options:", err.message);
    return FALLBACK_SUBJECTS;
  }
};

/**
 * No fallback list here on purpose — the server stores a real trainer
 * `_id`, so inventing placeholder options would only produce a payload
 * the API rejects.
 */
export const fetchTrainerOptions = async () => {
  try {
    return normaliseOptions(await apiGetDailyTaskTrainers());
  } catch (err) {
    console.error("Could not load trainer options:", err.message);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

/** Server task → the flat shape the components render. */
const normaliseTask = (raw) => ({
  id: raw._id || raw.id,
  userId: raw.userId,
  date: raw.date ? toDateKey(raw.date) : "",
  title: raw.title || "",
  description: raw.notes || "",
  status: fromApiStatus(raw.status),
  category: raw.subjectId?.name || "",
  categoryId: raw.subjectId?._id || raw.subjectId || "",
  hoursLabel: raw.hourId?.label || "",
  hoursId: raw.hourId?._id || raw.hourId || "",
  trainerName: raw.trainerId?.name || "",
  trainerId: raw.trainerId?._id || raw.trainerId || "",
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

/** Form values → the payload the server expects. */
const toApiPayload = (form) => {
  const payload = {};
  if (form.title !== undefined) payload.title = form.title.trim();
  if (form.description !== undefined) payload.notes = form.description.trim();
  if (form.categoryId !== undefined) payload.subjectId = form.categoryId;
  if (form.hoursId !== undefined) payload.hourId = form.hoursId;
  if (form.trainerId !== undefined) payload.trainerId = form.trainerId;
  if (form.status !== undefined) payload.status = toApiStatus(form.status);
  if (form.date !== undefined) payload.date = form.date;
  return payload;
};

/**
 * Tasks for one user on one date.
 * Returns { tasks, summary } — the endpoint counts the statuses for us.
 */
export const listTasks = async (userId, dateKey, statusSlug) => {
  // The endpoint filters by status server-side; "all" means send nothing.
  const status =
    statusSlug && statusSlug !== "all" ? toApiStatus(statusSlug) : undefined;

  const res = await apiGetDailyTasks(userId, dateKey, status);
  const body = res.data?.data;

  const list = Array.isArray(body) ? body : body?.data;
  const tasks = (Array.isArray(list) ? list : [])
    .filter((t) => t && !t.deleted)
    .map(normaliseTask);

  return { tasks, summary: body?.summary || null };
};

/**
 * POST /daily-task/create — the endpoint sets the initial status itself,
 * so the payload carries exactly the documented fields.
 */
export const createTask = async (userId, form) => {
  const res = await apiCreateDailyTask({
    userId,
    title: (form.title || "").trim(),
    subjectId: form.categoryId,
    hourId: form.hoursId,
    trainerId: form.trainerId,
    notes: (form.description || "").trim(),
    date: form.date,
  });

  const created = res.data?.data;
  return created ? normaliseTask(created) : null;
};

export const updateTask = async (taskId, patch) => {
  const res = await apiUpdateDailyTask(taskId, toApiPayload(patch));
  const updated = res.data?.data;
  return updated ? normaliseTask(updated) : null;
};

export const deleteTask = async (taskId) => {
  await apiDeleteDailyTask(taskId);
  return true;
};

/** Local fallback for when the response carries no summary block. */
export const summarise = (tasks) => {
  const completed = tasks.filter((t) => t.status === STATUS.COMPLETED).length;
  const inProgress = tasks.filter((t) => t.status === STATUS.IN_PROGRESS).length;
  const pending = tasks.filter((t) => t.status === STATUS.PENDING).length;

  return { total: tasks.length, completed, inProgress, pending };
};
