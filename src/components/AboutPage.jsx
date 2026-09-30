const workflow = [
  { number: '01', title: 'Add a credential', detail: 'Save a website, username, and password together in one entry.' },
  { number: '02', title: 'Find it when needed', detail: 'Search by website, username, or password. Browse larger vaults ten entries at a time.' },
  { number: '03', title: 'Use and maintain it', detail: 'Copy values, reveal a row when you need to see it, then edit or remove entries as they change.' },
]

const AboutPage = ({ onNavigate }) => (
  <main className="about-page">
    <header className="about-heading">
      <h1>Credentials, in order.</h1>
      <p className="about-lede">PASSVAULT brings the website, username, and password you need into one searchable place.</p>
    </header>

    <section className="workflow-section" aria-labelledby="workflow-title">
      <h2 id="workflow-title">From saved to found</h2>
      <ol className="workflow-list">
        {workflow.map((step) => (
          <li className="workflow-step" key={step.number}>
            <span className="workflow-number">{step.number}</span>
            <div><h3>{step.title}</h3><p>{step.detail}</p></div>
          </li>
        ))}
      </ol>
    </section>

    <aside className="storage-note" aria-labelledby="storage-title">
      <h2 id="storage-title">Storage, plainly stated</h2>
      <p>Account vault entries are encrypted in your browser before they are sent to your account. Your account password unlocks that encryption. If it is forgotten, encrypted entries cannot be recovered. Existing browser-only entries stay on this device and are not moved automatically.</p>
    </aside>

    <a className="about-action" href="/home" onClick={(event) => { event.preventDefault(); onNavigate('/home') }}>
      Open your vault
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
    </a>
  </main>
)

export default AboutPage