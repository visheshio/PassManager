import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    let passwords = localStorage.getItem("passwords");
    if (passwords) {
      setPasswordArray(JSON.parse(passwords));
    }
  }, []);


  const showPassword = () => {
    passwordRef.current.type = "text";
    alert("show the password");
    if (ref.current.src.includes("hide.png")) {
      ref.current.src = "show.png";
      passwordRef.current.type = "password";
    } else {
      ref.current.src = "hide.png";
      passwordRef.current.type = "text";
    }
  };
  const savePassword = () => {
    if (!form.site || !form.username || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    let updatedPasswords;

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
        theme: "light",
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
        theme: "light",
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
        theme: "light",
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
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handleEdit = (entry, index) => {
    setform(entry);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (index) => {
    const updatedPasswords = passwordArray.filter((_, currentIndex) => currentIndex !== index);
    setPasswordArray(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));

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
      theme: "light",
      transition: Bounce,
    });
  };

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
        theme="light"
        transition="Bounce"
      />
      <div className="flex flex-col items-center justify-center">
        <div
          className="icon-wrap mt-4 pt-4"
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

        <div className="text-wrap mt-3 text-center">
          <h1 className="font-bold tracking-tight text-white">
            Password Manager
          </h1>
          <p className="mt-1 font-mono text-sm text-white/70">
            Your Own Password Manager.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-2xl rounded-2xl bg-white/5 px-10 py-2 text-white shadow-lg backdrop-blur-xl">
        <div className="flex flex-col p-2 text-white">
          <input
            value={form.site}
            onChange={handleChange}
            type="text"
            className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-white placeholder:text-white/50"
            name="site"
            id="websitename"
            placeholder="Enter Website Name"
          />
        </div>
        <div className="mx-auto flex gap-12 p-4">
          <input
            value={form.username}
            onChange={handleChange}
            type="text"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-0.5 text-white placeholder:text-white/50"
            name="username"
            id="Username"
            placeholder="Enter Username"
          />
          <input
            ref={passwordRef}
            value={form.password}
            onChange={handleChange}
            type="password"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-0.5 text-white placeholder:text-white/50"
            name="password"
            id="Password"
            placeholder="Enter Password"
          />
          <span
            className="text-white/70 absolute right-23 top-16.5 cursor-pointer"
            onClick={showPassword}
          >
            <img
              ref={ref}
              className="w-8 h-8 p-1 invert-100"
              src="show.png"
              alt="show"
              srcset=""
            />
          </span>
        </div>
        <button
          onClick={savePassword}
          className="mx-auto mt-4 flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg hover:shadow-violet-500/20"
        >
          <span className="add-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          {editingIndex !== null ? "Update Password" : "Add Password"}
        </button>
      </div>

      <div className="password-table-section mt-10">
        <h2 className="text-center text-xl font-semibold text-white">
          Your Saved Passwords
        </h2>
        <div className="password-table-wrap mx-auto mt-5 max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_50px_rgba(139,92,246,0.18)] backdrop-blur-xl">
          <table className="password-table w-full border-separate border-spacing-y-3 text-left text-sm text-white/85">
            <thead>
              <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {passwordArray.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No passwords saved yet.
                  </td>
                </tr>
              ) : (
                passwordArray.map((entry, index) => (
                  <tr key={`${entry.site}-${entry.username}-${index}`}>
                    <td>
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
                    <td>
                      <div className="value-cell">
                        <span className="value-text">{entry.username}</span>
                        <button
                          type="button"
                          className={`copy-btn ${copiedKey === `username-${index}` ? "copied" : ""}`}
                          onClick={() =>
                            copyToClipboard(entry.username, `username-${index}`)
                          }
                          aria-label={`Copy username for ${entry.username}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="value-cell">
                        <span className="value-text">{entry.password}</span>
                        <button
                          type="button"
                          className={`copy-btn ${copiedKey === `password-${index}` ? "copied" : ""}`}
                          onClick={() =>
                            copyToClipboard(entry.password, `password-${index}`)
                          }
                          aria-label={`Copy password for ${entry.username}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Manager;
