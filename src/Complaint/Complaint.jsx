import React, { useEffect, useState } from "react";
import styles from "./Complaint.module.css";
import ComplaintModal from "./ComplaintModal";
import { getComplaint } from "../api/serviceapi";
import Loader from "../loader/Loader";

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
      <div className={styles.topBar}>
        <h2 className={styles.heading}>Complaint</h2>

        <button className={styles.newBtn} onClick={() => setOpenModal(true)}>
          + New Complaint
        </button>
      </div>

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
                  <td>
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </td>

                  <td>{item.summary}</td>

                  <td className={styles.message}>{item.message}</td>

                  <td>
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
