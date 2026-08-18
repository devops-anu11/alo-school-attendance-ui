import React, { useState } from "react";
import styles from "./Harassment.module.css";
import { createHarassment } from "../api/serviceapi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageHero from "../Layouts/PageHero";

const Harassment = () => {
  const [formData, setFormData] = useState({
    description: "",
  });

  const [errors, setErrors] = useState({
    description: "",
  });

  const handleChange = (e) => {
    const { value } = e.target;

    setFormData({
      description: value,
    });

    let error = "";

    if (!value.trim()) {
      error = "Description is required";
    } else if (value.trim().length < 15) {
      error = "Description must be at least 15 characters";
    }

    setErrors({
      description: error,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 15) {
      newErrors.description = "Description must be at least 15 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const payload = {
        studentId: localStorage.getItem("userId"),
        message: formData.description,
      };

      const response = await createHarassment(payload);

      console.log(response.data);

      toast.success("Harassment report submitted successfully!", {
        autoClose: 1000,
        closeButton: false,
        className: styles.customToast,
      });

      setFormData({
        description: "",
      });

      setErrors({
        description: "",
      });
    } catch (error) {
      console.error(error);

      const errorMsg =
        error?.response?.data?.message || "Failed to submit harassment report.";

      toast.error(errorMsg, {
        autoClose: 1000,
        closeButton: false,
        className: styles.customToast,
      });
    }
  };

  return (
    <div className={styles.container}>
      <PageHero
        eyebrow="Confidential"
        eyebrowTone="warn"
        title="Harassment Report"
        subtitle="Report an incident safely. Only the authorised committee can see it."
      />

      <div className={styles.card}>
        <div className={styles.notice}>
          <strong>Confidential:</strong> Your report will be kept confidential
          and reviewed only by the authorized committee.
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Description</label>

            <textarea
              rows="6"
              name="description"
              placeholder="Describe the incident..."
              value={formData.description}
              onChange={handleChange}
            />

            {errors.description && (
              <span className={styles.error}>{errors.description}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn}>
            Submit Report
          </button>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        closeButton={false}
      />
    </div>
  );
};

export default Harassment;
