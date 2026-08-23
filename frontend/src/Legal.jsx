import React from 'react';
import { Link } from 'react-router-dom';

const Shell = ({ title, children }) => (
  <div className="min-h-screen p-4 sm:p-8 overflow-x-hidden">
    <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-10">
      <Link to="/" className="text-sm text-primary hover:underline">← Back to Quanterm</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-6">{title}</h1>
      <div className="space-y-4 text-sm text-white/80 leading-relaxed">{children}</div>
    </div>
  </div>
);

export const Privacy = () => (
  <Shell title="Privacy Policy">
    <p>Last updated: 23 August 2026. This policy describes how Quanterm (“we”) handles personal data under the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.</p>
    <p><strong className="text-white">What we collect.</strong> Account name, email, hashed password, optional authenticator secrets, portfolio holdings you add, and product settings. We do not sell personal data.</p>
    <p><strong className="text-white">Why we collect it.</strong> To authenticate you, persist settings, show portfolio analytics, and send transactional email (verification and password reset).</p>
    <p><strong className="text-white">Cookies.</strong> We use httpOnly session cookies (access and refresh tokens). They are not used for advertising.</p>
    <p><strong className="text-white">Retention.</strong> Account data is kept until you delete the account. Logs may be retained for up to 90 days for security.</p>
    <p><strong className="text-white">Contact.</strong> privacy@quanterm.local — replace with your production address before launch.</p>
  </Shell>
);

export const Terms = () => (
  <Shell title="Terms of Service">
    <p>Last updated: 23 August 2026. By using Quanterm you agree to these terms.</p>
    <p><strong className="text-white">Not investment advice.</strong> Quanterm is an analytics tool. Nothing on the platform is investment advice, a solicitation, or a recommendation under the SEBI (Investment Advisers) Regulations, 2013. You remain solely responsible for investment decisions.</p>
    <p><strong className="text-white">Market data.</strong> Quotes may come from third-party providers (for example Alpha Vantage). Redistribution of NSE/BSE data may require a licence. Displayed prices can be delayed or incomplete.</p>
    <p><strong className="text-white">Broker connections.</strong> Broker sync is not live until each broker approves developer access. Placeholder data is not your real holdings.</p>
    <p><strong className="text-white">Accounts.</strong> You must provide a real email you control. You are responsible for keeping 2FA credentials safe.</p>
    <p><strong className="text-white">Limitation.</strong> The service is provided as-is. We are not liable for trading losses or data-provider outages.</p>
  </Shell>
);
