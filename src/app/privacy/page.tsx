import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Kasrah Games',
  description: 'Privacy Policy for Kasrah Games - Learn how we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>Last Updated: January 22, 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-800">1. Introduction</h2>
            <p>Welcome to Kasrah Games. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and games.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">3. Google AdSense and Cookies</h2>
            <p>We use Google AdSense to serve ads when you visit our website. Google may use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet.</p>
            <p>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 underline">Ads Settings</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">4. Third-Party Links</h2>
            <p>This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">5. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">6. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us via our contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}