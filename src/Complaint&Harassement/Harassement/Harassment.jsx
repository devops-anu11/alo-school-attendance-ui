import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Harassment.module.css";
import { createHarassment } from "../../api/serviceapi";
import { toast } from "react-toastify";

const Harassment = () => {
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    description: "",
  });                 
                      
  const [errors, setErrors] = useState({
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  

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

  
    if (submitting) {
      return;
    }

 
    if (!validate()) {
      return;
    }

    try {
      
      setSubmitting(true);

      const payload = {
        studentId: userId,
        message: formData.description.trim(),
      };

      const response = await createHarassment(payload);

      console.log("Harassment API Response:", response.data);

      toast.success("Harassment report submitted successfully!", {
        autoClose: 1000,
        closeButton: false,
      });

    
      setFormData({
        description: "",
      });

      setErrors({
        description: "",
      });
    } catch (error) {
      console.error("Harassment API Error:", error);

      const errorMsg =
        error?.response?.data?.message || "Failed to submit harassment report.";

      toast.error(errorMsg, {
        autoClose: 1000,
        closeButton: false,
      });
    } finally {
    
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.notice}>
        <strong>Confidential:</strong> Your report will be kept confidential and
        reviewed only by the authorized committee.
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
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

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting}
        >
          {submitting ? (
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
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
};

export default Harassment;
