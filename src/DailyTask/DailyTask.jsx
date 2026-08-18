import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./DailyTask.module.css";
import TaskModal from "./TaskModal";
import PageHero from "../Layouts/PageHero";
import Loader from "../loader/Loader";
import noDataImg from "../assets/AloLogo/nodatasearch.png";

import {
  FiPlus,
  FiEdit2,
  FiCheck,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCcw,
} from "react-icons/fi";

import {
  STATUS,
  STATUS_LABEL,
  listTasks,
  createTask,
  updateTask,
  toDateKey,
  formatDateKey,
} from "./dailyTaskStore";

const shiftDate = (dateKey, days) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(y, m - 1, d + days);
  return toDateKey(next);
};

const DailyTask = () => {
  const params = useParams();
  const userId = params.userId || localStorage.getItem("userId");

  const [dateKey, setDateKey] = useState(toDateKey());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const todayKey = toDateKey();
  const isToday = dateKey === todayKey;
  const isFuture = dateKey > todayKey;

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const result = await listTasks(userId, dateKey);
      setTasks(result.tasks);
    } catch (err) {
      console.error("Failed to load daily tasks:", err.message);
      toast.error("Could not load your tasks", { autoClose: 1500 });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId, dateKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Freeze the page behind a dialog so the wheel scrolls the dialog, not the list.
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      if (editingTask) {
        await updateTask(editingTask.id, form);
        toast.success("Task updated", { autoClose: 1200 });
      } else {
        await createTask(userId, { ...form, date: dateKey });
        toast.success("Task added", { autoClose: 1200 });
      }
      setModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Could not save the task", { autoClose: 1500 });
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = async (task) => {
    const next =
      task.status === STATUS.PENDING
        ? STATUS.IN_PROGRESS
        : task.status === STATUS.IN_PROGRESS
          ? STATUS.COMPLETED
          : STATUS.PENDING;

    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
      );
      await updateTask(task.id, { status: next });
      await fetchTasks();
      toast.success(`Marked as ${STATUS_LABEL[next]}`, { autoClose: 1000 });
    } catch (err) {
      console.error(err);
      toast.error("Could not update the status", { autoClose: 1500 });
      fetchTasks();
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer position="top-right" theme="colored" />
      {loading && <Loader />}

      {/* ---------- Page header ---------- */}
      <PageHero
        eyebrow={isToday ? "Today" : formatDateKey(dateKey).split(",")[0]}
        eyebrowTone={isToday ? "success" : "neutral"}
        title="Daily Task Update"
        subtitle="Log what you worked on today and keep your progress visible."
        /* Tasks can only be logged against today, so the button is hidden
           whenever the user is browsing another date. */
        action={
          isToday ? (
            <button className={styles.heroBtn} onClick={openCreate}>
              <FiPlus /> Add Task
            </button>
          ) : null
        }
      />

      {/* ---------- Date strip ---------- */}
      <div className={styles.dateBar}>
        <button
          className={styles.navBtn}
          onClick={() => setDateKey(shiftDate(dateKey, -1))}
          aria-label="Previous day"
        >
          <FiChevronLeft />
        </button>

        <div className={styles.dateLabel}>
          <strong>{formatDateKey(dateKey)}</strong>
          {isToday && <span className={styles.todayChip}>Today</span>}
        </div>

        <button
          className={styles.navBtn}
          onClick={() => setDateKey(shiftDate(dateKey, 1))}
          aria-label="Next day"
        >
          <FiChevronRight />
        </button>

        <div className={styles.dateSpacer} />

        <input
          type="date"
          className={styles.datePicker}
          value={dateKey}
          onChange={(e) => e.target.value && setDateKey(e.target.value)}
        />

        {!isToday && (
          <button
            className={styles.ghostBtn}
            onClick={() => setDateKey(todayKey)}
          >
            <FiRotateCcw /> Today
          </button>
        )}
      </div>

      {/* ---------- Task list ---------- */}
      {!loading && tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <img src={noDataImg} alt="" className={styles.emptyImg} />
          <h3>
            {isFuture
              ? "Nothing planned for this day yet"
              : "No tasks logged for this day"}
          </h3>
          <p>
            {isToday
              ? "Add your first task to start tracking your daily progress."
              : "Go back to today to log a new task."}
          </p>
          {isToday && (
            <button className={styles.primaryBtn} onClick={openCreate}>
              <FiPlus /> Add Task
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Subject</th>
                  <th>Class Hour</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={
                      task.status === STATUS.COMPLETED ? styles.doneRow : ""
                    }
                  >
                    <td>
                      <div className={styles.taskCell}>
                        <button
                          className={`${styles.checkBtn} ${
                            styles[`chk_${task.status}`]
                          }`}
                          onClick={() => cycleStatus(task)}
                          title={`Mark as ${
                            task.status === STATUS.PENDING
                              ? STATUS_LABEL[STATUS.IN_PROGRESS]
                              : task.status === STATUS.IN_PROGRESS
                                ? STATUS_LABEL[STATUS.COMPLETED]
                                : STATUS_LABEL[STATUS.PENDING]
                          }`}
                        >
                          {task.status === STATUS.COMPLETED ? (
                            <FiCheck />
                          ) : task.status === STATUS.IN_PROGRESS ? (
                            <FiClock />
                          ) : null}
                        </button>

                        <div className={styles.taskText}>
                          <span className={styles.taskTitle}>{task.title}</span>
                          {task.description && (
                            <span className={styles.taskDesc}>
                              {task.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{task.category || "—"}</td>

                    <td>{task.hoursLabel || "—"}</td>

                    <td>
                      <span
                        className={`${styles.chip} ${
                          styles[`s_${task.status}`]
                        }`}
                      >
                        {STATUS_LABEL[task.status]}
                      </span>
                    </td>

                    <td>
                      <div className={styles.taskActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEdit(task)}
                          aria-label="Update task status"
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- Modals ---------- */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        dateLabel={formatDateKey(dateKey)}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
      />

    </div>
  );
};

export default DailyTask;
