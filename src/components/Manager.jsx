import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { decryptVaultEntry, encryptVaultEntry } from "../vaultCrypto";

const PAGE_SIZE = 10;

const matchesSearch = (entry, query) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return [entry.site, entry.username, entry.password].some((value) =>
    String(value ?? "").toLocaleLowerCase().includes(normalizedQuery)
  );
};

const Manager = ({ account, vaultKey }) => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState(() => {
    if (account && vaultKey) return [];
    try {
      const passwords = localStorage.getItem("passwords");
      return passwords ? JSON.parse(passwords) : [];
    } catch {
      return [];
    }
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [revealedEntries, setRevealedEntries] = useState(() => new Set());
  const [vaultLoading, setVaultLoading] = useState(Boolean(account && vaultKey));
  const [vaultError, setVaultError] = useState("");
  const accountId = account?.id;

  useEffect(() => {
    if (!accountId || !vaultKey) return;
    let active = true;
    const loadVault = async () => {
      try {
        const response = await fetch("/api/vault");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load the account vault.");
        const decryptedEntries = await Promise.all(
          result.records.map(async (record) => ({
            ...(await decryptVaultEntry(record, vaultKey)),
            id: record.id,
          }))
        );
        if (active) setPasswordArray(decryptedEntries);
      } catch (error) {
        if (active) setVaultError(error.message || "Could not unlock the account vault.");
      } finally {
        if (active) setVaultLoading(false);
      }
    };

    loadVault();
    return () => { active = false; };
  }, [accountId, vaultKey]);


  const showPassword = () => {
    if (!passwordRef.current) return;
    if (passwordRef.current.type === "password") {
      passwordRef.current.type = "text";
      if (ref.current) ref.current.src = "/hide.png";
    } else {
      passwordRef.current.type = "password";
      if (ref.current) ref.current.src = "/show.png";
    }
  };
  const savePassword = async () => {
    if (!form.site || !form.username || !form.password) {
      toast.error("Please fill in all fields", { position: "top-right", autoClose: 3000, theme: "dark", transition: Bounce });
      return;
    }

    let updatedPasswords;

    if (account && vaultKey) {
      try {
        const encryptedRecord = await encryptVaultEntry(form, vaultKey);
        if (editingIndex !== null) {
          const existingEntry = passwordArray[editingIndex];
          const response = await fetch(`/api/vault/${existingEntry.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(encryptedRecord),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.message || "Could not update this entry.");
          updatedPasswords = passwordArray.map((entry, index) =>
            index === editingIndex ? { ...form, id: existingEntry.id } : entry
          );
          toast.info("Password updated", { position: "top-right", autoClose: 3000, theme: "dark", transition: Bounce });
        } else {
          const response = await fetch("/api/vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(encryptedRecord),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.message || "Could not save this entry.");
          updatedPasswords = [...passwordArray, { ...form, id: result.id }];
          toast.success("Password saved", { position: "top-right", autoClose: 3000, theme: "dark", transition: Bounce });
        }
      } catch (error) {
        toast.error(error.message || "Could not save the encrypted vault entry.", { position: "top-right", autoClose: 5000, theme: "dark", transition: Bounce });
        return;
      }

      setPasswordArray(updatedPasswords);
      setform({ site: "", username: "", password: "" });
      setEditingIndex(null);
      return;
    }

    if (editingIndex !== null) {
      updatedPasswords = passwordArray.map((entry, index) =>
        index === editingIndex ? form : entry
      );
      toast.info("Password updated", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } else {
      updatedPasswords = [...passwordArray, form];
      toast.success("Password Saved", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }

    setPasswordArray(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    setform({ site: "", username: "", password: "" });
    setEditingIndex(null);
  };
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const toggleEntryVisibility = (entry) => {
    setRevealedEntries((currentEntries) => {
      const nextEntries = new Set(currentEntries);
      if (nextEntries.has(entry)) {
        nextEntries.delete(entry);
      } else {
        nextEntries.add(entry);
      }
      return nextEntries;
    });
  };

  const copyToClipboard = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
      toast.success("Copied to clipboard", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch {
      toast.error("Unable to copy to clipboard", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  const handleEdit = (entry, index) => {
    setform(entry);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (index) => {
    const entryToDelete = passwordArray[index];
    if (account && vaultKey) {
      try {
        const response = await fetch(`/api/vault/${entryToDelete.id}`, { method: "DELETE" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not delete this entry.");
      } catch (error) {
        toast.error(error.message || "Could not delete this vault entry.", { position: "top-right", autoClose: 5000, theme: "dark", transition: Bounce });
        return;
      }
    }

    const updatedPasswords = passwordArray.filter((_, currentIndex) => currentIndex !== index);
    setPasswordArray(updatedPasswords);
    if (!account || !vaultKey) localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    setRevealedEntries((currentEntries) => {
      const nextEntries = new Set(currentEntries);
      nextEntries.delete(passwordArray[index]);
      return nextEntries;
    });
    setCurrentPage((page) =>
      Math.min(
        page,
        Math.max(
          1,
          Math.ceil(
            updatedPasswords.filter((entry) => matchesSearch(entry, searchTerm)).length /
              PAGE_SIZE
          )
        )
      )
    );

    if (editingIndex === index) {
      setEditingIndex(null);
      setform({ site: "", username: "", password: "" });
    }

    toast.warn("Password deleted", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  };

  const filteredPasswords = passwordArray
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => matchesSearch(entry, searchTerm));
  const pageCount = Math.max(1, Math.ceil(filteredPasswords.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const firstVisibleIndex = (visiblePage - 1) * PAGE_SIZE;
  const visiblePasswords = filteredPasswords.slice(
    firstVisibleIndex,
    firstVisibleIndex + PAGE_SIZE
  );
  const firstResult = filteredPasswords.length === 0 ? 0 : firstVisibleIndex + 1;
  const lastResult = firstVisibleIndex + visiblePasswords.length;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition="Bounce"
      />
      <main className="manager-page">
        <header className="manager-header">
          <div
            className="icon-wrap"
            role="img"
            aria-label="Animated password lock icon"
          >
            <svg
              viewBox="0 0 128 128"
              className="lock-icon"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="lock-shackle"
                d="M42 52V38c0-15.5 12.5-28 28-28s28 12.5 28 28v14"
              />
              <rect
                className="lock-body"
                x="28"
                y="52"
                width="72"
                height="54"
                rx="12"
              />
              <circle className="lock-core" cx="64" cy="78" r="8" />
              <path className="lock-line" d="M64 86v12" />
            </svg>
          </div>

          <div className="text-wrap">
            <h1>Password Manager</h1>
            <p>Your Own Password Manager.</p>
          </div>
        </header>

      <section className="password-form" aria-label="Password details">
        <div className="form-grid">
          <label className="field">
            <span>Website</span>
            <input
              value={form.site}
              onChange={handleChange}
              type="text"
              className="form-input"
              name="site"
              id="websitename"
              placeholder="Enter Website Name"
            />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              value={form.username}
              onChange={handleChange}
              type="text"
              className="form-input"
              name="username"
              id="Username"
              placeholder="Enter Username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="password-input-wrap">
              <input
                ref={passwordRef}
                value={form.password}
                onChange={handleChange}
                type="password"
                className="form-input password-input"
                name="password"
                id="Password"
                placeholder="Enter Password"
              />
              <button
                type="button"
                className="visibility-button"
                onClick={showPassword}
                aria-label="Show or hide password"
              >
                <img ref={ref} src="/show.png" alt="" />
              </button>
            </div>
          </label>
        </div>
        <button
          onClick={savePassword}
          className="primary-button"
        >
          <span className="add-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          {editingIndex !== null ? "Update Password" : "Add Password"}
        </button>
      </section>

      <section className="password-table-section">
        <h2>
          {account ? "Your Encrypted Account Vault" : "Your Saved Passwords"}
        </h2>
        {account && <p className="account-vault-label">Signed in as {account.email} · encrypted before storage</p>}
        {vaultLoading && <p className="vault-status" role="status">Decrypting your vault…</p>}
        {vaultError && <p className="vault-error" role="alert">{vaultError}</p>}
        <div className="password-list-controls">
          <label className="search-control">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search site, username, or password"
              aria-label="Search site, username, or password"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </label>
          <p className="result-count" aria-live="polite">
            Showing {firstResult}-{lastResult} of {filteredPasswords.length}
          </p>
        </div>
        <div className="password-table-wrap">
          <table className="password-table">
            <thead>
              <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaultLoading ? (
                <tr><td colSpan="4" className="empty-state">Decrypting your account vault…</td></tr>
              ) : vaultError ? (
                <tr><td colSpan="4" className="empty-state">Your encrypted vault could not be opened. Sign out and try again.</td></tr>
              ) : filteredPasswords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    {searchTerm.trim()
                      ? "No saved credentials match your search."
                      : "No passwords saved yet."}
                  </td>
                </tr>
              ) : (
                visiblePasswords.map(({ entry, index }) => {
                  const isRevealed = revealedEntries.has(entry);
                  return (
                  <tr key={`${entry.site}-${entry.username}-${index}`}>
                    <td data-label="Website">
                      <div className="value-cell">
                        <a
                          className="value-link"
                          href={
                            entry.site.startsWith("http")
                              ? entry.site
                              : `https://${entry.site}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {entry.site}
                        </a>
                        <button
                          type="button"
                          className={`copy-btn ${copiedKey === `site-${index}` ? "copied" : ""}`}
                          onClick={() =>
                            copyToClipboard(entry.site, `site-${index}`)
                          }
                          aria-label={`Copy website for ${entry.site}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td data-label="Username">
                      <div className="value-cell">
                        <span
                          className={`value-text ${isRevealed ? "" : "masked-value"}`}
                          aria-label={isRevealed ? entry.username : "Hidden username"}
                        >
                          {isRevealed ? entry.username : "••••••••"}
                        </span>
                        <button
                          type="button"
                          className={`copy-btn ${copiedKey === `username-${index}` ? "copied" : ""}`}
                          onClick={() =>
                            copyToClipboard(entry.username, `username-${index}`)
                          }
                          aria-label={`Copy ${isRevealed ? entry.username : "hidden username"}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td data-label="Password">
                      <div className="value-cell">
                        <span
                          className={`value-text ${isRevealed ? "" : "masked-value"}`}
                          aria-label={isRevealed ? "Password visible" : "Hidden password"}
                        >
                          {isRevealed ? entry.password : "••••••••"}
                        </span>
                        <button
                          type="button"
                          className={`copy-btn ${copiedKey === `password-${index}` ? "copied" : ""}`}
                          onClick={() =>
                            copyToClipboard(entry.password, `password-${index}`)
                          }
                          aria-label={`Copy ${isRevealed ? "password" : "hidden password"} for ${isRevealed ? entry.username : "this entry"}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className="action-cell">
                        <button
                          type="button"
                          className="action-btn visibility-row-btn"
                          onClick={() => toggleEntryVisibility(entry)}
                          aria-label={`${isRevealed ? "Hide" : "Show"} username and password for ${entry.site}`}
                          aria-pressed={isRevealed}
                        >
                          {isRevealed ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m3 3 18 18" />
                              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                              <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 9.5 7 9.5 7a16 16 0 0 1-3.1 3.9" />
                              <path d="M6.2 6.2C3.8 7.9 2.5 12 2.5 12s3.3 7 9.5 7c.8 0 1.6-.1 2.3-.4" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(entry, index)}
                          aria-label={`Edit ${entry.site}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(index)}
                          aria-label={`Delete ${entry.site}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <nav className="pagination" aria-label="Saved credential pages">
            <button
              type="button"
              onClick={() => setCurrentPage(visiblePage - 1)}
              disabled={visiblePage === 1}
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {visiblePage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(visiblePage + 1)}
              disabled={visiblePage === pageCount}
            >
              Next
            </button>
          </nav>
        )}
      </section>
      </main>
    </>
  );
};

export default Manager;
