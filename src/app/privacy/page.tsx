import { PageHeading } from "@/components/elements/page-heading";
import { ReturnHome } from "@/components/elements/return-home";

export const experimental_ppr = true;

export default function Privacy() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <PageHeading
        heading="Privacy Policy"
        subheading="Last Updated: April 29, 2025"
      />

      {/* Privacy Content */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">1. INTRODUCTION</h3>
          <p className="text-base leading-relaxed mb-6">
            Welcome to Death Matter LLC ("Company," "we," "our," or "us"). We
            respect your privacy and are committed to protecting the personal
            information you share with us. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website deathmattertools.com (the "Site") or use our
            memorial and obituary services.
          </p>
          <p className="text-base leading-relaxed">
            PLEASE READ THIS PRIVACY POLICY CAREFULLY. By accessing or using our
            Site and services, you acknowledge that you have read, understood,
            and agree to be bound by all the terms of this Privacy Policy. If
            you do not agree with our policies and practices, please do not use
            our Site or services.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">2. INFORMATION WE COLLECT</h3>
          <p className="text-base leading-relaxed mb-6">
            We collect information from and about users of our Site in several
            ways:
          </p>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">
              2.1 Personal Information You Provide to Us
            </h4>
            <p className="text-base leading-relaxed mb-4">
              When you register for an account, generate quotes, research
              individuals, write obituaries, or use other features of our Site,
              we may collect various types of personal information, including
              but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li>Name, email address, and contact information</li>
              <li>
                Birth dates, death dates, and other biographical information
              </li>
              <li>Account login credentials</li>
              <li>
                Payment information (processed through secure third-party
                payment processors)
              </li>
              <li>
                Information about deceased individuals for obituary and memorial
                purposes
              </li>
              <li>Any other information you choose to provide</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              2.2 Information Collected Automatically
            </h4>
            <p className="text-base leading-relaxed mb-4">
              When you visit our Site, we automatically collect certain
              information about your device and browsing actions, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed mb-4">
              <li>IP address and device identifiers</li>
              <li>Browser type and operating system</li>
              <li>Pages you view on our Site</li>
              <li>Time and duration of your visits</li>
              <li>Referring websites or search engines</li>
            </ul>
            <p className="text-base leading-relaxed">
              This information is collected using cookies, web beacons, and
              similar technologies. We use these technologies to improve our
              Site, remember your preferences, analyze trends, and provide
              personalized content.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">3. HOW WE USE YOUR INFORMATION</h3>
          <p className="text-base leading-relaxed mb-4">
            We may use the information we collect for various purposes,
            including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and manage your account registration</li>
            <li>Fulfill your requests for obituary and memorial services</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>
              Send you technical notices, updates, security alerts, and support
              messages
            </li>
            <li>
              Monitor and analyze trends, usage, and activities in connection
              with our Site
            </li>
            <li>
              Detect, investigate, and prevent fraudulent transactions and other
              illegal activities
            </li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">4. DISCLOSURE OF YOUR INFORMATION</h3>
          <p className="text-base leading-relaxed mb-6">
            We do not sell or rent your personal information to third parties.
            However, we may share your information in the following
            circumstances:
          </p>

          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              4.1 Public Information
            </h3>
            <p className="text-base leading-relaxed">
              Any information you choose to publish on our Site as part of an
              obituary or memorial will be accessible to the public. Please
              exercise caution when deciding what information to make public.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              4.2 Service Providers
            </h3>
            <p className="text-base leading-relaxed">
              We may share your information with third-party vendors, service
              providers, contractors, or agents who perform functions on our
              behalf, such as payment processing, data analysis, email delivery,
              hosting services, and customer service.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              4.3 Legal Requirements
            </h3>
            <p className="text-base leading-relaxed">
              We may disclose your information if required to do so by law or in
              the good faith belief that such action is necessary to comply with
              legal obligations, protect and defend our rights or property,
              prevent fraud, or protect the personal safety of users of the Site
              or the public.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              4.4 Business Transfers
            </h3>
            <p className="text-base leading-relaxed">
              If we are involved in a merger, acquisition, financing, or sale of
              all or a portion of our assets, your information may be
              transferred as part of that transaction.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">5. DATA SECURITY</h3>
          <p className="text-base leading-relaxed">
            We implement reasonable security measures to protect your personal
            information from unauthorized access, disclosure, alteration, and
            destruction. However, no Internet or electronic storage system is
            100% secure, and we cannot guarantee absolute security of your
            information. We are not responsible for circumvention of any privacy
            settings or security measures on our Site.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">6. YOUR CHOICES</h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">6.1 Account Information</h4>
            <p className="text-base leading-relaxed">
              You may update, correct, or delete your account information at any
              time by logging into your account or contacting us. We may retain
              certain information as required by law or for legitimate business
              purposes.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">
              6.2 Cookies and Tracking Technologies
            </h4>
            <p className="text-base leading-relaxed">
              Most web browsers are set to accept cookies by default. If you
              prefer, you can usually choose to set your browser to remove or
              reject cookies. Please note that if you choose to remove or reject
              cookies, this could affect the availability and functionality of
              our Site.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">6.3 Marketing Communications</h4>
            <p className="text-base leading-relaxed">
              You may opt out of receiving promotional emails from us by
              following the unsubscribe instructions included in those emails.
              Even if you opt out, we may still send you non-promotional emails,
              such as those about your account or our ongoing business
              relations.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">7. CHILDREN'S PRIVACY</h3>
          <p className="text-base leading-relaxed">
            Our Site is not directed to children under the age of 13, and we do
            not knowingly collect personal information from children. If you are
            a parent or guardian and believe that your child has provided us
            with personal information, please contact us, and we will delete
            such information from our systems.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">8. INTERNATIONAL DATA TRANSFERS</h3>
          <p className="text-base leading-relaxed">
            While we primarily operate in the United States, our Site is
            accessible worldwide. If you are accessing our Site from outside the
            United States, please be aware that your information may be
            transferred to, stored, and processed in the United States or other
            countries where our servers are located. By using our Site, you
            consent to the transfer of your information to countries outside
            your country of residence, which may have different data protection
            rules than those in your country.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">9. CHANGES TO THIS PRIVACY POLICY</h3>
          <p className="text-base leading-relaxed">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. We will post the revised Privacy Policy on this
            page with an updated revision date. Your continued use of our Site
            following the posting of changes constitutes your acceptance of such
            changes.
          </p>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 px-4 md:px-6 flex justify-center">
        <ReturnHome />
      </section>
    </main>
  );
}