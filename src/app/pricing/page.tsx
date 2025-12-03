import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your needs. Upgrade or downgrade at any time.
        </p>
      </div>
      
      <div className="space-y-16">
        {/* Individual Plans Section */}
        <section className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Individual Plans</h2>
            <p className="text-muted-foreground">
              Perfect for personal use and individual creators
            </p>
          </div>
          <PricingTable />
        </section>

        {/* Organization Plans Section */}
        <section className="max-w-screen-2xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Organization Plans</h2>
            <p className="text-muted-foreground">
              Designed for teams and businesses with collaborative features
            </p>
          </div>
          <PricingTable for="organization" />
        </section>
      </div>
    </div>
  )
}