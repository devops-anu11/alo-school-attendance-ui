import React, { useEffect, useState } from "react";
import styles from "./TaskModal.module.css";
import { FiX } from "react-icons/fi";
import {
  fetchHourOptions,
  fetchSubjectOptions,
  fetchTrainerOptions,
} from "./dailyTaskStore";

const EMPTY = {
  title: "",
  category: "",
  description: "",
  hours: "",
  trainer: "",
};

const TaskModal = ({ open, task, dateLabel, onClose, onSave, saving }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [hourOptions, setHourOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Dropdown contents come from the server; both fall back to a built-in
  // list if the request fails so the form is never unusable.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoadingOptions(true);
      const [hours, subjects, trainers] = await Promise.all([
        fetchHourOptions(),
        fetchSubjectOptions(),
        fetchTrainerOptions(),
      ]);
      if (cancelled) return;
      setHourOptions(hours);
      setSubjectOptions(subjects);
      setTrainerOptions(trainers);
      setLoadingOptions(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            title: task.title || "",
            category: task.categoryId || task.category || "",
            description: task.description || "",
            hours: task.hoursId || "",
            trainer: task.trainerId || "",
          }
        : EMPTY
    );
    setErrors({});
  }, [open, task]);

  if (!open) return null;

  const isEdit = Boolean(task);

  // An older record may hold a value that is no longer in the option list —
  // show its saved label rather than rendering an empty select.
  const missingOption = (options, value, label) =>
    value && !options.some((o) => o.id === value) ? (
      <option value={value}>{label || value}</option>
    ) : null;

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Task title is required";
        if (value.trim().length < 3) return "Use at least 3 characters";
        return "";
      case "hours":
        return value === "" ? "Please select the class hour" : "";
      case "category":
        return value === "" ? "Please select a subject" : "";
      case "trainer":
        return value === "" ? "Please select the trainer" : "";
      case "description":
        if (!value.trim()) return "Please add a short update";
        if (value.trim().length < 5) return "Use at least 5 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = Object.keys(EMPTY).reduce(
      (acc, key) => ({ ...acc, [key]: validateField(key, form[key]) }),
      {}
    );
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const pick = (options, value) =>
      options.find((o) => o.id === value || o.label === value);

    const hour = pick(hourOptions, form.hours);
    const subject = pick(subjectOptions, form.category);
    const trainer = pick(trainerOptions, form.trainer);

    onSave({
      ...form,
      hoursId: hour?.id || form.hours,
      hoursLabel: hour?.label || "",
      category: subject?.label || form.category,
      categoryId: subject?.id || form.category,
      trainerId: trainer?.id || form.trainer,
      trainerName: trainer?.label || "",
    });
  };

  return (
    // Deliberately no click-outside-to-close — a half-filled form should
    // only be dismissed through Cancel or the × button.
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>
              {isEdit ? "Update Task" : "Add Task"}
            </h2>
            <p className={styles.subtitle}>{dateLabel}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Only this block scrolls — the title and the buttons stay put. */}
          <div className={styles.body}>
            <div className={styles.field}>
              <label htmlFor="title">
                Task title <span className={styles.req}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Revise Unit 3 — Data Structures"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                autoFocus
              />
              {errors.title && (
                <span className={styles.error}>{errors.title}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="hours">
                Class hour <span className={styles.req}>*</span>
              </label>
              <select
                id="hours"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">
                  {loadingOptions ? "Loading…" : "Select class hour"}
                </option>
                {missingOption(hourOptions, form.hours, task?.hoursLabel)}
                {hourOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
              {errors.hours && (
                <span className={styles.error}>{errors.hours}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="category">
                Subject / Category <span className={styles.req}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">
                  {loadingOptions ? "Loading…" : "Select subject"}
                </option>
                {missingOption(subjectOptions, form.category, task?.category)}
                {subjectOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className={styles.error}>{errors.category}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="trainer">
                Trainer <span className={styles.req}>*</span>
              </label>
              <select
                id="trainer"
                name="trainer"
                value={form.trainer}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">
                  {loadingOptions ? "Loading…" : "Select trainer"}
                </option>
                {missingOption(trainerOptions, form.trainer, task?.trainerName)}
                {trainerOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.trainer && (
                <span className={styles.error}>{errors.trainer}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="description">
                Update / Notes <span className={styles.req}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="What did you work on? Anything blocking you?"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
              />
              {errors.description && (
                <span className={styles.error}>{errors.description}</span>
              )}
              <div className={styles.counter}>
                {form.description.length}/500
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
