import React, { useState } from "react";
import styles from "./ComplaintModal.module.css";
import { MdReportProblem } from "react-icons/md";
import { createComplaint } from "../api/serviceapi";
import { toast } from "react-toastify";

const ComplaintModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    subject: "",
    description: "",
  });

  if (!open) return null;

  // Live Validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    let error = "";

    switch (name) {
      case "subject":
        if (!value.trim()) {
          error = "Subject is required";
        } else if (value.trim().length < 5) {
          error = "Subject must be at least 5 characters";
        } else if (value.trim().length > 100) {
          error = "Subject cannot exceed 100 characters";
        }
        break;

      case "description":
        if (!value.trim()) {
          error = "Description is required";
        } else if (value.trim().length < 15) {
          error = "Description must be at least 15 characters";
        } else if (value.trim().length > 500) {
          error = "Description cannot exceed 500 characters";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 15) {
      newErrors.description = "Description must be at least 15 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // 👇 Get userId from localStorage
      const userId = localStorage.getItem("userId");

      // 👇 Payload
      const payload = {
        studentId: userId,
        summary: formData.subject.trim(),
        message: formData.description.trim(),
      };

      // 👇 API Call
      const response = await createComplaint(payload);

      console.log(response.data);

      toast.success("Complaint submitted successfully!", {
        autoClose: 1000,
        closeButton: false,
      });

      setFormData({
        subject: "",
        description: "",
      });

      setErrors({
        subject: "",
        description: "",
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to submit complaint.",
        {
          autoClose: 1000,
          closeButton: false,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subject: "",
      description: "",
    });

    setErrors({
      subject: "",
      description: "",
    });

    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Complaint Icon */}
        <div className={styles.iconWrapper}>
          <MdReportProblem className={styles.icon} />
        </div>

        <h2 className={styles.title}>New Complaint</h2>

        <div className={styles.formGroup}>
          <label>Subject</label>

          <input
            type="text"
            name="subject"
            placeholder="Enter complaint subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={100}
          />

          {errors.subject && (
            <span className={styles.error}>{errors.subject}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>

          <textarea
            rows="6"
            name="description"
            placeholder="Describe your complaint..."
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
          />

          {errors.description && (
            <span className={styles.error}>{errors.description}</span>
          )}

          <div className={styles.counter}>
            {formData.description.length}/500
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loader}>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  viewBox="0 0 50 50"
                >
                  <path
                    fill="#fff"
                    d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068
                    c0-8.071,6.543-14.615,14.615-14.615V6.461z"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 25 25"
                      to="360 25 25"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              </div>
            ) : (
              "Submit"
            )}
          </button>

          <button
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
