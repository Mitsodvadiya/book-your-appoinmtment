import Link from 'next/link'
import { 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Bell,
  ArrowRight,
  CheckCircle2,
  Stethoscope
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

const features = [
  {
    icon: Clock,
    title: 'Real-Time Queue',
    description: 'Track patient wait times and manage queues efficiently with live updates.'
  },
  {
    icon: Users,
    title: 'Patient Management',
    description: 'Complete patient records, visit history, and easy registration process.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Insights into clinic performance, peak hours, and patient flow patterns.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'HIPAA-compliant data handling with encrypted patient information.'
  },
  {
    icon: Zap,
    title: 'Fast & Efficient',
    description: 'Reduce wait times by up to 50% with smart queue optimization.'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Automated alerts for patients and staff about queue status changes.'
  }
]

const benefits = [
  'Reduce patient wait times significantly',
  'Streamline front desk operations',
  'Real-time queue visibility for all staff',
  'Digital token system - no more paper tickets',
  'Multi-doctor support with individual queues',
  'Easy patient check-in process'
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ClinicQueue</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Modern Queue Management for{' '}
              <span className="text-primary">Healthcare</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Streamline your clinic operations with our intelligent patient queue system. 
              Reduce wait times, improve patient satisfaction, and optimize your workflow.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '500+', label: 'Clinics' },
              { value: '50K+', label: 'Patients Served' },
              { value: '50%', label: 'Wait Time Reduced' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Manage Your Clinic
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed specifically for healthcare providers
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Why Choose ClinicQueue?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join hundreds of clinics that have transformed their patient experience.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20" />
                      <div>
                        <div className="font-medium text-foreground">Current Patient</div>
                        <div className="text-sm text-muted-foreground">Token #42</div>
                      </div>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      In Progress
                    </div>
                  </div>
                  {[43, 44, 45].map((token) => (
                    <div key={token} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Token #{token}</div>
                          <div className="text-xs text-muted-foreground">Waiting</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">~{(token - 42) * 10} min</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Transform Your Clinic?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start your free trial today. No credit card required.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">ClinicQueue</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 ClinicQueue. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
