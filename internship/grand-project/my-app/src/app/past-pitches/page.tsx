'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
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
  Eye,
  Menu,
  X
} from "lucide-react"
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PastPitchesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            <Link href="/pitch">
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent cursor-pointer text-sm lg:text-base">
                <Plus className="mr-3 h-4 w-4" />
                New Pitch
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer text-sm lg:text-base"
            >
              <History className="mr-3 h-4 w-4" />
              Past Pitches
            </Button>
          </div>

          {/* User Profile */}
          <div className="pt-4 border-t border-border mt-auto">
            <div className="flex items-center space-x-3 p-2">
              <div className="p-2 bg-accent rounded-full">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  User Profile
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userId ? userId.slice(0, 8) + '...' : 'Loading...'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 mt-2 cursor-pointer text-sm lg:text-base"
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
          <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Link href="/pitch" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to New Pitch
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">Past Pitches</h1>
                  <p className="text-sm lg:text-base text-gray-600">View and manage all your generated pitches</p>
                </div>
              </div>
            </div>

            {/* Mobile Back Button */}
            <div className="sm:hidden mb-4">
              <Link href="/pitch">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to New Pitch
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search your pitches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-background/50 backdrop-blur-sm"
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
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">
                    {filteredPitches.length} {filteredPitches.length === 1 ? 'Pitch' : 'Pitches'} Found
                  </h2>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                            <CardTitle className="text-sm lg:text-base font-medium text-blue-600 line-clamp-2">
                              {title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                              {index < 3 ? 'Recent' : 'Older'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-3 mb-3 text-sm">
                            {problem || pitch.idea}
                          </CardDescription>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center min-w-0 flex-1">
                              <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {pitch.createdAt 
                                  ? new Date(pitch.createdAt).toLocaleDateString()
                                  : new Date().toLocaleDateString()
                                }
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-700 cursor-pointer flex-shrink-0 ml-2">
                              <Eye className="mr-1 h-3 w-3" />
                              <span className="hidden sm:inline">View</span>
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
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <h2 className="text-lg lg:text-2xl font-bold text-gray-900 pr-4">
                        {selectedPitch.response?.title || selectedPitch.idea || 'App Name'}
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
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
                            Problem
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                            {selectedPitch.response?.problem || "No problem description available"}
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
                            {selectedPitch.response?.solution || "No solution description available"}
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
                            {selectedPitch.response?.targetMarket || "No target market information available"}
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
                            {selectedPitch.response?.revenueModel || "No revenue model information available"}
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
                            {selectedPitch.response?.callToAction || "No call to action available"}
                          </p>
                        </CardContent>
                      </Card>
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
        </div>
      </div>
    </div>
  )
}