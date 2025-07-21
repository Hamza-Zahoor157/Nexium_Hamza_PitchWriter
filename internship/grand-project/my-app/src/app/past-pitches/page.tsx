'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Zap,
  ArrowLeft,
  Calendar,
  Eye
} from "lucide-react"
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PastPitchesPage() {
  interface Pitch {
    _id: string;
    userId: string;
    idea: string;
    response: {
      title?: string;
      description?: string;
      problem?: string;
      solution?: string;
      targetMarket?: string;
      revenueModel?: string;
      callToAction?: string;
    };
    createdAt?: string;
  }

  const [pitches, setPitches] = useState<Pitch[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPitch, setSelectedPitch] = useState<any>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
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
      
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    fetchPitches()
  }, [userId])

  const filteredPitches = pitches.filter(pitch => 
    pitch.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pitch.response?.title && pitch.response.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
            <Link href="/pitch">
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-100">
                <Plus className="mr-3 h-4 w-4" />
                New Pitch
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <Home className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <History className="mr-3 h-4 w-4" />
              Past Pitches
            </Button>
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
          </div>

          {/* User Profile */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-2">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  User Profile
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userId ? userId.slice(0, 8) + '...' : 'Loading...'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 mt-2"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/pitch">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to New Pitch
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Past Pitches</h1>
                  <p className="text-gray-600">View and manage all your generated pitches</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search your pitches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full max-w-md"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your pitches...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPitches.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No pitches found' : 'No pitches yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start by creating your first pitch'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/pitch">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Pitch
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Pitches Grid */}
            {!loading && filteredPitches.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredPitches.length} {filteredPitches.length === 1 ? 'Pitch' : 'Pitches'} Found
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPitches.map((pitch, index) => {
                    // Safely access response data with fallbacks
                    const response = pitch.response || {};
                    const title = response.title || 'App Name';
                    const problem = response.problem || 'No problem statement available';
                    const solution = response.solution || 'No solution details available';
                    const targetMarket = response.targetMarket || 'Target market not specified';
                    const revenueModel = response.revenueModel || 'Revenue model not specified';
                    const callToAction = response.callToAction || 'Contact us for more information';
                    
                    return (
                      <Card 
                        key={pitch._id || index} 
                        className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                        onClick={() => setSelectedPitch({
                          ...pitch,
                          response: {
                            title,
                            problem,
                            solution,
                            targetMarket,
                            revenueModel,
                            callToAction,
                            description: response.description || ''
                          }
                        })}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base font-medium text-blue-600 line-clamp-2">
                              {title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs ml-2">
                              {index < 3 ? 'Recent' : 'Older'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-3 mb-3">
                            {problem || pitch.idea}
                          </CardDescription>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {pitch.createdAt 
                                ? new Date(pitch.createdAt).toLocaleDateString()
                                : new Date().toLocaleDateString()
                              }
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-700">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pitch Detail Modal/View */}
            {selectedPitch && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPitch.response?.title || selectedPitch.idea || 'App Name'}
                      </h2>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedPitch(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </Button>
                    </div>

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
                            {selectedPitch.response?.problem || "No problem description available"}
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
                            {selectedPitch.response?.solution || "No solution description available"}
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
                            {selectedPitch.response?.targetMarket || "No target market information available"}
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
                            {selectedPitch.response?.revenueModel || "No revenue model information available"}
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
                            {selectedPitch.response?.callToAction || "No call to action available"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
