'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Building2,
  Clock,
  Bell,
  Palette,
  Save,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function SettingsPage() {
  const { setShowGuide } = useAuthStore()
  
  const [settings, setSettings] = useState({
    clinicName: 'City Care Clinic',
    clinicAddress: '123 Health Street, Medical District',
    openingTime: '09:00',
    closingTime: '18:00',
    tokenPrefix: 'TKN',
    autoCallNext: true,
    soundNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    darkMode: true,
    compactView: false,
  })

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Settings saved:', settings)
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        subtitle="Configure clinic and system preferences"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Clinic Information */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Clinic Information
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={settings.clinicName}
                  onChange={(e) =>
                    setSettings({ ...settings, clinicName: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Token Prefix
                </label>
                <input
                  type="text"
                  value={settings.tokenPrefix}
                  onChange={(e) =>
                    setSettings({ ...settings, tokenPrefix: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Clinic Address
              </label>
              <input
                type="text"
                value={settings.clinicAddress}
                onChange={(e) =>
                  setSettings({ ...settings, clinicAddress: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Operating Hours
            </h3>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Opening Time
              </label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) =>
                  setSettings({ ...settings, openingTime: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Closing Time
              </label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) =>
                  setSettings({ ...settings, closingTime: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Queue Settings */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <RefreshCw className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Queue Settings
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Auto Call Next</p>
                <p className="text-sm text-muted-foreground">
                  Automatically call next patient when current is completed
                </p>
              </div>
              <Switch
                checked={settings.autoCallNext}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoCallNext: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Notifications
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Sound Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Play sound when a new token is called
                </p>
              </div>
              <Switch
                checked={settings.soundNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, soundNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send SMS to patients when their turn approaches
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for appointments
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the dashboard
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, darkMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Compact View</p>
                <p className="text-sm text-muted-foreground">
                  Use compact layout for tables and lists
                </p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, compactView: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Help & Support</h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium text-foreground">Getting Started Guide</p>
                <p className="text-sm text-muted-foreground">
                  Take a tour of the dashboard and learn the key features
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowGuide(true)}
              >
                Start Guide
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
