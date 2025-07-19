// 'use client'
// import { supabase } from '@/lib/supabaseClient'
// import { useState } from 'react'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [sent, setSent] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async () => {
//     setLoading(true)
//     const { error } = await supabase.auth.signInWithOtp({
//       email,
//       options: {
//         emailRedirectTo: `${window.location.origin}/pitch`,
//       },
//     })
//     setLoading(false)
//     if (!error) setSent(true)
//     else alert(error.message)
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-xl">
//         <h2 className="text-3xl font-bold text-white mb-6">Welcome Back 👋</h2>
//         {sent ? (
//           <p className="text-green-400 text-center">✅ Magic link sent! Check your email.</p>
//         ) : (
//           <>
//             <label className="block text-sm font-medium text-white mb-2">Email Address</label>
//             <input
//               type="email"
//               className="w-full p-3 mb-4 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <button
//               onClick={handleLogin}
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
//             >
//               {loading ? 'Sending...' : 'Login with Magic Link'}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Separator } from "@/components/ui/separator"
import { PenTool, Mail, CheckCircle, Loader2, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/pitch`,
      },
    })
    setLoading(false)
    if (!error) setSent(true)
    else alert(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Pitch Writer
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Enter your email to receive a magic link
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-slate-900 dark:text-slate-100">
                <PenTool className="h-5 w-5 text-blue-500" />
                Pitch Writer
              </CardTitle>
              <CardDescription>
                Access your AI-powered pitch writing tools
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {sent ? (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Magic link sent! Check your email to continue.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      'Send magic link'
                    )}
                  </Button>
                </div>
              )}

              
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Why Pitch Writer?
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                AI-powered pitch generation
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Professional templates
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Real-time collaboration
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md dark:bg-slate-900/80 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="my-4 border-t border-gray-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1 bg-blue-500 rounded">
                <PenTool className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Pitch Writer</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2025 Pitch Writer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}