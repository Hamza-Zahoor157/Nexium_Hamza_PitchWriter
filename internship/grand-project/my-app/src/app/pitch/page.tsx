'use client'

import React, { useEffect, useState } from 'react'
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
  ChevronRight,
  Eye,
  Calendar,
  Menu,
  X
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
  const [selectedPitch, setSelectedPitch] = useState<{ _id: string; idea: string; response: PitchResponse; createdAt?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 z-50 w-64 bg-card shadow-sm border-r border-border transition-transform duration-300 ease-in-out lg:flex lg:flex-col h-full`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <PenTool className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-foreground">Pitch Writer</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          <div className="space-y-1">
            <Button
              variant="secondary"
              className="w-full justify-start text-sm lg:text-base"
            >
              <Plus className="mr-3 h-4 w-4" />
              New Pitch
            </Button>
            <Link href="/past-pitches">
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent text-sm lg:text-base">
                <History className="mr-3 h-4 w-4" />
                Previous Pitches
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search pitches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 lg:w-60 bg-background border-border focus:bg-card"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">Log out</span>
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
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-1">Create Your Pitch</h1>
              <p className="text-sm text-muted-foreground">Describe your startup idea and generate a compelling pitch</p>
            </div>

            {/* Input Form */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idea" className="block text-sm font-medium text-foreground mb-1">
                    Your Startup Idea
                  </Label>
                  <Textarea
                    id="idea"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your startup idea in one or two sentences..."
                    className="min-h-[80px] lg:min-h-[100px] text-foreground bg-background border-border placeholder:text-muted-foreground/60"
                    required
                  />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !idea.trim()}
                    className="w-full sm:w-auto cursor-pointer"
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
              <div className="grid gap-4 lg:gap-6">
                {/* Problem Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
                      Problem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {response.problem || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Solution Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                      Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {response.solution || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Target Market Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                      Target Market
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {response.targetMarket || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue Model Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-500" />
                      Revenue Model
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {response.revenueModel || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>

                {/* Call to Action Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Target className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                      Call to Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {response.callToAction || "Generated content will appear here..."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-4 lg:gap-6">
                {[
                  { title: 'Problem', icon: Lightbulb, color: 'text-amber-500' },
                  { title: 'Solution', icon: Zap, color: 'text-green-500' },
                  { title: 'Target Market', icon: Users, color: 'text-blue-500' },
                  { title: 'Revenue Model', icon: DollarSign, color: 'text-emerald-500' },
                  { title: 'Call to Action', icon: Target, color: 'text-purple-500' }
                ].map((section, index) => (
                  <Card key={index} className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <section.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${section.color}`} />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-sm lg:text-base">
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
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Previously Generated Pitches</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPitches.slice(0, 6).map((pitch, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm lg:text-base font-medium text-blue-600 line-clamp-2">
                            {pitch.response?.title || pitch.idea}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                            {index < 3 ? 'Recent' : 'Older'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-3 mb-3 text-sm">
                          {pitch.response?.problem || pitch.idea}
                        </CardDescription>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span className="truncate">
                              {pitch.createdAt 
                                ? new Date(pitch.createdAt).toLocaleDateString()
                                : new Date().toLocaleDateString()
                              }
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-blue-600 hover:text-blue-700 cursor-pointer flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPitch(pitch);
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
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

      {/* Pitch Detail Modal */}
      {selectedPitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900 pr-4">
                  {selectedPitch.response?.title || selectedPitch.idea || 'Pitch Details'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPitch(null)}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 lg:gap-6">
                {/* Problem Section */}
                {selectedPitch.response?.problem && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
                        Problem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{selectedPitch.response.problem}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Solution Section */}
                {selectedPitch.response?.solution && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                        Solution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{selectedPitch.response.solution}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Target Market Section */}
                {selectedPitch.response?.targetMarket && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <Target className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                        Target Market
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{selectedPitch.response.targetMarket}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue Model Section */}
                {selectedPitch.response?.revenueModel && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                        Revenue Model
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{selectedPitch.response.revenueModel}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Call to Action Section */}
                {selectedPitch.response?.callToAction && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-500" />
                        Call to Action
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{selectedPitch.response.callToAction}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="mt-4 lg:mt-6 flex justify-end">
                <Button
                  onClick={() => setSelectedPitch(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}