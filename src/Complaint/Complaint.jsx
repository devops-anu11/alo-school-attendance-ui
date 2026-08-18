import React, { useEffect, useState } from "react";
import styles from "./Complaint.module.css";
import ComplaintModal from "./ComplaintModal";
import { getComplaint } from "../api/serviceapi";
import Loader from "../loader/Loader";
import PageHero from "../Layouts/PageHero";
import { FiMessageSquare, FiClock, FiCheckCircle } from "react-icons/fi";

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      // Use studentId if your API expects studentId
      const studentId = localStorage.getItem("userId");

      const res = await getComplaint(studentId);

      console.log("Complaint API Response:", res.data);

      setComplaints(res.data?.data?.data || []);
    } catch (error) {
      console.log("Complaint API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHero
        title="Complaint"
        subtitle="Raise an issue with the school and follow its progress."
        action={
          <button className={styles.newBtn} onClick={() => setOpenModal(true)}>
            + New Complaint
          </button>
        }
        stats={[
          {
            key: "total",
            label: "Total Raised",
            value: complaints.length,
            hint: "All time",
            tone: "brand",
            icon: <FiMessageSquare />,
          },
          {
            key: "pending",
            label: "Pending",
            value: complaints.filter((c) => c.status === "pending").length,
            hint: "Awaiting review",
            tone: "warn",
            icon: <FiClock />,
          },
          {
            key: "accepted",
            label: "Accepted",
            value: complaints.filter((c) => c.status === "accepted").length,
            hint: "Actioned",
            tone: "success",
            icon: <FiCheckCircle />,
          },
        ]}
      />

      {loading ? (
        <Loader />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length > 0 ? (
              complaints.map((item) => (
                <tr key={item._id}>
                  <td data-label="Date">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </td>

                  <td data-label="Subject">{item.summary}</td>

                  <td data-label="Description" className={styles.message}>
                    {item.message}
                  </td>

                  <td data-label="Status">
                    <span
                      className={`${styles.status} ${
                        item.status === "pending"
                          ? styles.pending
                          : item.status === "accepted"
                            ? styles.accepted
                            : styles.rejected
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <ComplaintModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          setOpenModal(false);
          fetchComplaints();
        }}
      />
    </div>
  );
};

export default Complaint;
