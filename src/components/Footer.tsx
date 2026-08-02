import { PROJECTS } from "@/lib/data";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid reveal in">
        <div className="log">
          <div>
            <b>[run complete]</b> {PROJECTS.length}/{PROJECTS.length} test cases passed inspection
          </div>
          <div>
            <b>[note]</b> full case list (12) available on request
          </div>
        </div>
        <div className="contact-links">
          <a href="https://github.com/Shree-2004" target="_blank" rel="noopener">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/shree-londhe-b082b2245" target="_blank" rel="noopener">
            LinkedIn
          </a>
          <a href="mailto:shreelondhe2004@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
}
