import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-8 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/icon.jpeg" alt="Incamp icon" className="w-10 h-10 rounded-lg object-contain" />
            <h3 className="text-lg font-semibold">Incamp</h3>
          </div>
          <p className="text-sm text-primary-foreground/90 max-w-sm">Turning campus challenges into countable change through innovation and entrepreneurship.</p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/dashboard" className="opacity-90 hover:opacity-100">Dashboard</Link></li>
            <li><Link to="/problem-statements" className="opacity-90 hover:opacity-100">Problem Statements</Link></li>
            <li><Link to="/reviews" className="opacity-90 hover:opacity-100">Reviews & Approvals</Link></li>
            <li><Link to="/messages" className="opacity-90 hover:opacity-100">Messages / Alerts</Link></li>
            <li><Link to="/resources" className="opacity-90 hover:opacity-100">Resources</Link></li>
            <li><Link to="/profile" className="opacity-90 hover:opacity-100">Profile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-4">Contact Us</h4>
          <p className="text-sm opacity-90">hello.geenovate@gcet.edu.in</p>
          <p className="text-sm opacity-90 mt-2">GCET Campus, Greater Noida, India</p>
        </div>
      </div>

      <div className="border-t border-primary/30">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-primary-foreground/80">© 2026 Incamp – Chapter 1. Organized by Geenovate Foundation. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default Footer;
