import { PageHeading } from "@/components/elements/page-heading";
import { ReturnHome } from "@/components/elements/return-home";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <PageHeading
        heading="Terms of Service"
        subheading="Last Updated: April 29, 2025"
      />

      {/* Terms Content */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">1. ACCEPTANCE OF TERMS</h3>
          <p className="text-base leading-relaxed mb-6">
            Welcome to Death Matter LLC ("Company," "we," "our," or "us"). These
            Terms of Service ("Terms") govern your access to and use of Death
            Matter.com (the "Site") and any related services, features, content,
            or applications offered by Death Matter LLC (collectively, the
            "Services").
          </p>
          <p className="text-base leading-relaxed">
            PLEASE READ THESE TERMS CAREFULLY BEFORE USING OUR SERVICES. By
            accessing or using our Services, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree to these Terms,
            you must not access or use our Services.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">2. CHANGES TO TERMS</h3>
          <p className="text-base leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. The most current version will be posted on
            our Site with the effective date. Your continued use of our Services
            after any such changes constitutes your acceptance of the new Terms.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">
            3. ACCOUNT REGISTRATION AND SECURITY
          </h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">3.1 Account Creation</h4>
            <p className="text-base leading-relaxed">
              To access certain features of our Services, you may be required to
              register for an account. You agree to provide accurate, current,
              and complete information during the registration process and to
              update such information to keep it accurate, current, and
              complete.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">3.2 Account Responsibilities</h4>
            <p className="text-base leading-relaxed">
              You are responsible for safeguarding your account credentials and
              for all activities that occur under your account. You agree to
              notify us immediately of any unauthorized access to or use of your
              account. We are not liable for any losses or damages arising from
              your failure to comply with this section.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">3.3 Age Requirements</h4>
            <p className="text-base leading-relaxed">
              Our Services are available to users of all ages. However, if you
              are under the age of 18, you may only use our Services with the
              consent and supervision of a parent or legal guardian who agrees
              to be bound by these Terms.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">4. USE OF SERVICES</h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">4.1 License</h4>
            <p className="text-base leading-relaxed">
              Subject to these Terms, we grant you a limited, non-exclusive,
              non-transferable, and revocable license to access and use our
              Services for your personal, non-commercial use.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">4.2 Restrictions</h4>
            <p className="text-base leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li>
                Use the Services in any way that violates any applicable law or
                regulation
              </li>
              <li>
                Use the Services for any purpose that is unlawful or prohibited
                by these Terms
              </li>
              <li>
                Attempt to gain unauthorized access to any portion of the
                Services or any other systems or networks connected to the
                Services
              </li>
              <li>
                Collect or harvest any personal information from other users
              </li>
              <li>Use the Services to send unsolicited communications</li>
              <li>
                Use the Services in any manner that could disable, overburden,
                damage, or impair the Services
              </li>
              <li>
                Use any automated means or process to access, retrieve, scrape,
                or index the Services or any content on our Site
              </li>
              <li>
                Use the Services for any commercial purpose without our prior
                written consent
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">5. USER CONTENT</h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">5.1 Content Submission</h4>
            <p className="text-base leading-relaxed">
              Our Services allow you to submit, post, or display content,
              including but not limited to obituaries, memorials, photographs,
              and other materials ("User Content"). You retain all rights in
              your User Content, subject to the licenses granted in these Terms.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">5.2 Content License</h4>
            <p className="text-base leading-relaxed">
              By submitting User Content, you grant us a worldwide,
              non-exclusive, royalty-free license (with the right to sublicense)
              to use, copy, reproduce, process, adapt, modify, publish,
              transmit, display, and distribute such User Content in any and all
              media or distribution methods now known or later developed,
              particularly for the purpose of providing and promoting our
              Services.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">
              5.3 User Content Representations
            </h4>
            <p className="text-base leading-relaxed mb-4">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li>
                You own or have the right to use and authorize us to use your
                User Content as described in these Terms
              </li>
              <li>
                Your User Content, and our use of it, does not and will not
                infringe, violate, or misappropriate any third-party right,
                including intellectual property rights, publicity rights, or
                privacy rights
              </li>
              <li>
                Your User Content does not contain any material that is
                defamatory, obscene, indecent, abusive, offensive, harassing, or
                otherwise objectionable
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">5.4 Content Removal</h4>
            <p className="text-base leading-relaxed">
              We reserve the right, but not the obligation, to review, monitor,
              or remove any User Content, at our sole discretion and at any time
              and for any reason, without notice to you.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">6. DISCLAIMERS AND LIMITATIONS</h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">6.1 No Warranty</h4>
            <p className="text-base leading-relaxed">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT
              NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE,
              THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE
              SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER
              HARMFUL COMPONENTS.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">6.2 Accuracy Disclaimer</h4>
            <p className="text-base leading-relaxed">
              WE DO NOT GUARANTEE OR VERIFY THE ACCURACY, COMPLETENESS, OR
              RELIABILITY OF ANY INFORMATION OR CONTENT PROVIDED THROUGH OUR
              SERVICES, INCLUDING OBITUARIES, MEMORIALS, OR OTHER USER CONTENT.
              OUR SERVICES ARE TOOLS TO HELP GUIDE AND SUGGEST, BUT ALL FINAL
              DECISIONS AND VERIFICATION OF INFORMATION ARE THE RESPONSIBILITY
              OF THE USER.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">6.3 Limitation of Liability</h4>
            <p className="text-base leading-relaxed">
              IN NO EVENT SHALL WE, OUR DIRECTORS, OFFICERS, EMPLOYEES, AGENTS,
              PARTNERS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
              LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR
              INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR
              CONTENT OF ANY THIRD PARTY ON THE SERVICES; (III) ANY CONTENT
              OBTAINED FROM THE SERVICES; AND (IV) UNAUTHORIZED ACCESS, USE, OR
              ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON
              WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER
              LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE
              POSSIBILITY OF SUCH DAMAGE.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">6.4 Exclusions</h4>
            <p className="text-base leading-relaxed">
              Some jurisdictions do not allow the exclusion of certain
              warranties or the limitation or exclusion of liability for
              incidental or consequential damages. Accordingly, some of the
              above limitations may not apply to you.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            7. INDEMNIFICATION
          </h2>
          <p className="text-base leading-relaxed">
            You agree to defend, indemnify, and hold harmless Death Matter LLC,
            its officers, directors, employees, and agents, from and against any
            and all claims, damages, obligations, losses, liabilities, costs or
            debt, and expenses (including but not limited to attorney's fees)
            arising from: (i) your use of and access to the Services; (ii) your
            violation of any term of these Terms; (iii) your violation of any
            third-party right, including without limitation any copyright,
            property, or privacy right; or (iv) any claim that your User Content
            caused damage to a third party. This defense and indemnification
            obligation will survive these Terms and your use of the Services.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            8. THIRD-PARTY LINKS AND SERVICES
          </h2>
          <p className="text-base leading-relaxed">
            Our Services may contain links to third-party websites or services
            that are not owned or controlled by us. We have no control over, and
            assume no responsibility for, the content, privacy policies, or
            practices of any third-party websites or services. You acknowledge
            and agree that we shall not be responsible or liable, directly or
            indirectly, for any damage or loss caused or alleged to be caused by
            or in connection with the use of or reliance on any such content,
            goods, or services available on or through any such websites or
            services.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            9. TERMINATION
          </h2>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">9.1 Termination by You</h4>
            <p className="text-base leading-relaxed">
              You may terminate your account at any time by contacting us or by
              following the account deletion process provided within our
              Services.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              9.2 Termination by Us
            </h3>
            <p className="text-base leading-relaxed">
              We may terminate or suspend your account and access to our
              Services immediately, without prior notice or liability, for any
              reason whatsoever, including without limitation if you breach
              these Terms.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">9.3 Effect of Termination</h4>
            <p className="text-base leading-relaxed">
              Upon termination, your right to use the Services will immediately
              cease. All provisions of these Terms which by their nature should
              survive termination shall survive, including, without limitation,
              ownership provisions, warranty disclaimers, indemnity, and
              limitations of liability.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            10. GOVERNING LAW AND DISPUTE RESOLUTION
          </h2>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">10.1 Governing Law</h4>
            <p className="text-base leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the state of [INSERT STATE], without regard to its
              conflict of law provisions.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">10.2 Dispute Resolution</h4>
            <p className="text-base leading-relaxed">
              Any dispute arising out of or relating to these Terms or our
              Services shall first be attempted to be resolved through good
              faith negotiations. If such negotiations fail, any controversy or
              claim shall be submitted to binding arbitration in accordance with
              the rules of the American Arbitration Association. The arbitration
              shall be conducted in [INSERT CITY, STATE]. The arbitrator's award
              shall be binding and may be entered as a judgment in any court of
              competent jurisdiction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">10.3 Class Action Waiver</h4>
            <p className="text-base leading-relaxed">
              YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE
              CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS,
              CONSOLIDATED, OR REPRESENTATIVE ACTION. IF FOR ANY REASON A CLAIM
              PROCEEDS IN COURT RATHER THAN IN ARBITRATION, YOU WAIVE ANY RIGHT
              TO A JURY TRIAL.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-primary/10 mb-12">
          <h3 className="font-bold mb-6">11. GENERAL PROVISIONS</h3>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">11.1 Entire Agreement</h4>
            <p className="text-base leading-relaxed">
              These Terms constitute the entire agreement between you and us
              regarding our Services and supersede any prior or contemporaneous
              agreements, communications, and proposals, whether oral or
              written, between you and us.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">11.2 Waiver</h4>
            <p className="text-base leading-relaxed">
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights. If any provision of
              these Terms is held to be invalid or unenforceable by a court, the
              remaining provisions of these Terms will remain in effect.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold mb-4">11.3 Assignment</h4>
            <p className="text-base leading-relaxed">
              You may not assign or transfer these Terms, by operation of law or
              otherwise, without our prior written consent. Any attempt by you
              to assign or transfer these Terms without such consent will be
              null and void. We may assign or transfer these Terms, at our sole
              discretion, without restriction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">11.4 Force Majeure</h4>
            <p className="text-base leading-relaxed">
              We will not be liable for any failure or delay in performance
              resulting from causes beyond our reasonable control, including but
              not limited to acts of God, natural disasters, pandemic, war,
              terrorism, riots, civil unrest, government action, labor disputes,
              or Internet service disruptions.
            </p>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 px-4 md:px-6 flex justify-center">
        <ReturnHome />
      </section>
    </main>
  );
}