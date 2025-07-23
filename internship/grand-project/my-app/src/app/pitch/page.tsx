'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
// import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  PenTool, 
  Search, 
  LogOut, 
  Home, 
  Plus, 
  History, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  User,
  Loader2,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Zap,
  ChevronRight
} from "lucide-react"
import Link from 'next/link'
import { generatePitch, type PitchResponse } from '@/ai/n8n-chat';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PitchPage() {
  const [idea, setIdea] = useState('')
  const [response, setResponse] = useState<PitchResponse | null>(null)
  const [pitches, setPitches] = useState<Array<{ _id: string; idea: string; response: PitchResponse; createdAt?: string }>>([])
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setToken(session?.access_token || null)
      setUserId(session?.user?.id || null)
    }

    fetchSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    const fetchPitches = async () => {
      if (!userId) return
      
      try {
        const res = await fetch(`/api/pitch/user/${userId}`)
        
        if (!res.ok) {
          console.error('Failed to fetch pitches:', res.status, res.statusText)
          return
        }
        
        const text = await res.text()
        if (!text) {
          console.log('Empty response from server')
          setPitches([])
          return
        }
        
        const data = JSON.parse(text)
        setPitches(data.pitches || [])
      } catch (error) {
        console.error('Error fetching pitches:', error)
        setPitches([])
      }
    }

    fetchPitches()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!token || !userId) {
      alert('Please log in first.');
      return;
    }
  
    if (!idea.trim()) {
      alert('Please enter a startup idea.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Generate pitch
      const pitchResponse = await generatePitch(idea);
      if (!pitchResponse) {
        throw new Error('Failed to generate pitch');
      }
  
      // Save to database
      const res = await fetch('/api/pitch/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          idea, 
          response: pitchResponse,
          userId
        }),
      });
  
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save pitch');
      }
  
      // Update UI
      setResponse(pitchResponse);
      setPitches(prev => [{
        _id: result.data._id,
        userId: result.data.userId,
        idea: result.data.idea,
        response: result.data.response,
        createdAt: result.data.createdAt
      }, ...prev]);
      setIdea('');
      
    } catch (error) {
      console.error('Error generating pitch:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate pitch');
    } finally {
      setLoading(false);
    }
  };
  const filteredPitches = pitches.filter(pitch => {
    const searchLower = searchTerm.toLowerCase()
    return (
      pitch.idea.toLowerCase().includes(searchLower) ||
      (pitch.response?.title && pitch.response.title.toLowerCase().includes(searchLower)) ||
      (pitch.response?.problem && pitch.response.problem.toLowerCase().includes(searchLower)) ||
      (pitch.response?.solution && pitch.response.solution.toLowerCase().includes(searchLower)) ||
      (pitch.response?.targetMarket && pitch.response.targetMarket.toLowerCase().includes(searchLower)) ||
      (pitch.response?.revenueModel && pitch.response.revenueModel.toLowerCase().includes(searchLower)) ||
      (pitch.response?.callToAction && pitch.response.callToAction.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Pitch Writer</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Plus className="mr-3 h-4 w-4" />
              New Pitch
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <Home className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Link href="/past-pitches">
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-100">
                <History className="mr-3 h-4 w-4" />
                Previous Pitches
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <BarChart3 className="mr-3 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <HelpCircle className="mr-3 h-4 w-4" />
              Help
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <User className="mr-3 h-4 w-4" />
              Profile
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search pitches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-160 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              {/* <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Button
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Button
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Button
                </Badge>
              </div> */}
            </div>
            <div className="flex items-center space-x-4">
              {/* <Button className="bg-blue-600 hover:bg-blue-700">
                Generate Pitch
              </Button> */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Log out</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create Your Pitch</h1>
              <p className="text-gray-600">Enter your startup or product idea</p>
            </div>

            {/* Input Form */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idea-input" className="text-sm font-medium">
                      Describe your startup or product idea in detail...
                    </Label>
                    <Textarea
                      id="idea-input"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your startup or product idea in detail..."
                      className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !idea.trim()}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Pitch'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated Pitch Sections */}
            {response ? (
              <div className="grid gap-6">
                {/* Problem Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Problem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {response.problem || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Solution Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-green-500" />
                      Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {response.solution || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Target Market Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-blue-500" />
                      Target Market
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {response.targetMarket || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue Model Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      Revenue Model
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {response.revenueModel || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Call to Action Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-purple-500" />
                      Call to Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {response.callToAction || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-6">
                {[
                  { title: 'Problem', icon: Lightbulb, color: 'text-amber-500' },
                  { title: 'Solution', icon: Zap, color: 'text-green-500' },
                  { title: 'Target Market', icon: Users, color: 'text-blue-500' },
                  { title: 'Revenue Model', icon: DollarSign, color: 'text-emerald-500' },
                  { title: 'Call to Action', icon: Target, color: 'text-purple-500' }
                ].map((section, index) => (
                  <Card key={index} className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <section.icon className={`h-5 w-5 ${section.color}`} />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">
                        No content generated yet. Click the Generate Pitch button to create content for this section.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Previously Generated Pitches */}
            {filteredPitches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Previously Generated Pitches</h2>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPitches.slice(0, 6).map((pitch, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base font-medium text-blue-600 line-clamp-1">
                            {/*pitch.response.title ||*/ pitch.idea}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {index < 3 ? 'Recent' : 'Older'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-3">
                          {/*pitch.response.description ||*/ pitch.idea}
                        </CardDescription>
                        <div className="mt-3 text-xs text-gray-500">
                          Created: {new Date().toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}