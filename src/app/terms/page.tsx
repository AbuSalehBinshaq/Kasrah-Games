import React from 'react';

export const metadata = {
  title: 'Terms of Service | Kasrah Games',
  description: 'Terms of Service for Kasrah Games - Rules and guidelines for using our platform.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>Last Updated: January 22, 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-800">1. Acceptance of Terms</h2>
            <p>By accessing and using Kasrah Games, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">2. Use of the Site</h2>
            <p>You agree to use the site only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the site. Prohibited behavior includes harassing or causing distress or inconvenience to any other user.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">3. Intellectual Property</h2>
            <p>The games, content, and design of Kasrah Games are protected by copyright and other intellectual property rights. You may not copy, reproduce, or distribute any content from the site without express written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">4. Disclaimer of Warranties</h2>
            <p>The site is provided on an "as is" and "as available" basis. Kasrah Games makes no representations or warranties of any kind, express or implied, as to the operation of the site or the information, content, materials, or products included on the site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">5. Limitation of Liability</h2>
            <p>Kasrah Games will not be liable for any damages of any kind arising from the use of this site, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800">6. Changes to Terms</h2>
            <p>We reserve the right to change these terms at any time. Your continued use of the site following any changes shall be deemed to be your acceptance of such change.</p>
          </section>
        </div>
      </div>
    </div>
  );
}