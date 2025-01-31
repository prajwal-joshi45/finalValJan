import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { linkService } from "../services/linkService";

const Links = () => {
  const [links, setLinks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);
  const [newLinkForm, setNewLinkForm] = useState({
    destinationUrl: "",
    comments: "",
    hasExpiration: false,
    expirationDate: "",
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await linkService.getLinks();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleDelete = async (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await linkService.deleteLink(deleteItemId);
      setLinks(links.filter((link) => link._id !== deleteItemId));
      setShowDeleteModal(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleNewLinkSubmit = async (e) => {
    e.preventDefault();
    if (!newLinkForm.destinationUrl) return;
    try {
      const newLink = await linkService.createLink(newLinkForm);
      setLinks((prevLinks) => [...prevLinks, newLink]);
      setNewLinkForm({
        destinationUrl: "",
        comments: "",
        hasExpiration: false,
        expirationDate: "",
      });
      setShowNewLinkModal(false);
    } catch (error) {
      console.error("Error creating new link:", error);
    }
  };
  return (
    <div className={styles.linksContainer}>
      <div className={styles.linksTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Original Link</th>
              <th>Short Link</th>
              <th>Remarks</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link._id}>
                <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                <td className={styles.linkCell}>
                  <span className={styles.truncatedLink}>
                    {link.originalLink}
                  </span>
                </td>
                <td className={styles.linkCell}>
                  {link.shortLink}
                  <button
                    className={styles.copyButton}
                    title="Copy link"
                    onClick={() => {
                      navigator.clipboard.writeText(link.shortLink);
                      alert("Link copied to clipboard!");
                    }}
                  >
                    <span>📋</span>
                  </button>
                </td>
                <td>{link.remarks}</td>
                <td>{link.clicks}</td>
                <td>
                  <span className={`${styles.status} ${styles[link.status]}`}>
                    {link.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton} title="Edit">
                      ✏️
                    </button>
                    <button
                      className={styles.actionButton}
                      title="Delete"
                      onClick={() => handleDelete(link._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to remove this link?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalButtonNo}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItemId(null);
                }}
              >
                NO
              </button>
              <button className={styles.modalButtonYes} onClick={confirmDelete}>
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Links;
