'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Leaf, Star, Users, Clock, Heart, CheckCircle, ChevronLeft, ChevronRight, 
  Image, Plus, MapPin, Shield, AlertTriangle, Bookmark, Share2, Loader2,
  Camera, Quote
} from 'lucide-react'

import { MainLayout } from '@/components/layout/MainLayout'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers/Providers'
import type { RemedyWithDetails, RemedyTestimonial, RemedyVerification } from '@/types/database'

import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function TrustLevelIndicator({ level, showLabel = true }: { level: number; showLabel?: boolean }) {
  const getTrustColor = (level: number) => {
    if (level >= 4) return 'text-green-500 fill-green-500'
    if (level >= 3) return 'text-blue-500 fill-blue-500'
    if (level >= 2) return 'text-yellow-500 fill-yellow-500'
    return 'text-gray-400 fill-gray-400'
  }

  const getTrustLabel = (level: number) => {
    if (level >= 4) return 'Terpercaya'
    if (level >= 3) return 'Terverifikasi'
    if (level >= 2) return 'Menarik'
    return 'Baru'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${getTrustColor(level)}`}>
        {Array.from({ length: Math.min(level, 5) }).map((_, i) => (
          <Star key={i} className="h-4 w-4" />
        ))}
      </div>
      {showLabel && <span className="text-sm text-gray-600">{getTrustLabel(level)}</span>}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: RemedyTestimonial }) {
  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={(testimonial.user as any)?.avatar_url} />
            <AvatarFallback className="bg-green-200 text-green-800">
              {(testimonial.name || (testimonial.user as any)?.full_name || 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-green-800">
              {testimonial.name || (testimonial.user as any)?.full_name || 'Pengguna'}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-3 w-3", 
                      i < (testimonial.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
              {testimonial.location && (
                <span className="text-xs text-gray-500">• {testimonial.location}</span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(testimonial.created_at || '').toLocaleDateString('id-ID')}
        </span>
      </div>
      <p className="text-gray-700 text-sm">{testimonial.testimonial}</p>
      {testimonial.results_experienced && (
        <div className="mt-2 p-2 bg-white rounded border border-green-100">
          <p className="text-xs text-green-700">
            <strong>Hasil:</strong> {testimonial.results_experienced}
          </p>
        </div>
      )}
    </Card>
  )
}

function TestimonialForm({ remedyId, onSubmit }: { remedyId: string; onSubmit: () => void }) {
  const [rating, setRating] = useState(5)
  const [testimonial, setTestimonial] = useState('')
  const [location, setLocation] = useState('')
  const [usageDuration, setUsageDuration] = useState('')
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/remedies/${remedyId}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testimonial,
          rating,
          location,
          usage_duration: usageDuration,
          results_experienced: results
        })
      })

      if (response.ok) {
        setTestimonial('')
        setLocation('')
        setUsageDuration('')
        setResults('')
        setRating(5)
        onSubmit()
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 mb-4">Masuk untuk menulis testimoni</p>
        <Button className="bg-green-600 hover:bg-green-700">Masuk</Button>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-800">Bagikan Pengalaman Anda</CardTitle>
        <CardDescription>Ceritakan bagaimana ramuan ini membantu Anda</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={cn(
                    "text-2xl transition-colors",
                    i < rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                  )}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="testimonial">Testimoni *</Label>
            <Textarea
              id="testimonial"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Ceritakan pengalaman Anda menggunakan ramuan ini..."
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Jakarta"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration">Lama Penggunaan</Label>
              <Input
                id="duration"
                value={usageDuration}
                onChange={(e) => setUsageDuration(e.target.value)}
                placeholder="3 bulan"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="results">Hasil yang Dirasakan</Label>
            <Textarea
              id="results"
              value={results}
              onChange={(e) => setResults(e.target.value)}
              placeholder="Nyeri berkurang, tidur lebih nyenyak..."
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!testimonial || loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Kirim Testimoni
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function RemedyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [remedy, setRemedy] = useState<RemedyWithDetails | null>(null)
  const [testimonials, setTestimonials] = useState<RemedyTestimonial[]>([])
  const [similarRemedies, setSimilarRemedies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('recipe')
  const [activeImage, setActiveImage] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const supabase = createSupabaseClient()

  useEffect(() => {
    if (params.id) {
      loadRemedyData(params.id as string)
    }
  }, [params.id])

  const loadRemedyData = async (id: string) => {
    try {
      setLoading(true)

      // Load remedy details
      const response = await fetch(`/api/remedies/${id}`)
      const data = await response.json()

      if (response.ok) {
        setRemedy(data.remedy)
        
        // Increment view count
        fetch(`/api/remedies/${id}/increment-view`, { method: 'POST' })
      }

      // Load testimonials
      const testimonialsResponse = await fetch(`/api/remedies/${id}/testimonials`)
      const testimonialsData = await testimonialsResponse.json()
      setTestimonials(testimonialsData.testimonials || [])

      // Load similar remedies
      const similarResponse = await fetch(`/api/remedies/${id}/similar`)
      const similarData = await similarResponse.json()
      setSimilarRemedies(similarData.remedies || [])

    } catch (error) {
      console.error('Error loading remedy:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshTestimonials = () => {
    if (params.id) {
      fetch(`/api/remedies/${params.id}/testimonials`)
        .then(res => res.json())
        .then(data => setTestimonials(data.testimonials || []))
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </MainLayout>
    )
  }

  if (!remedy) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ramuan tidak ditemukan</h1>
            <Button onClick={() => router.push('/remedies')} className="bg-green-600 hover:bg-green-700">
              Kembali ke Ramuan
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/remedies')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Kembali ke Ramuan</span>
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isBookmarked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Info */}
            <div className="lg:col-span-1">
              {/* Main Image */}
              <div className="rounded-lg overflow-hidden bg-green-50 border border-green-100 mb-6">
                <div className="relative aspect-square">
                  {remedy.images && remedy.images.length > 0 ? (
                    <img 
                      src={remedy.images[activeImage]?.image_url || remedy.primary_image} 
                      alt={remedy.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
                      <Leaf className="w-20 h-20 text-green-400" />
                    </div>
                  )}
                </div>
                
                {/* Image thumbnails */}
                {remedy.images && remedy.images.length > 1 && (
                  <div className="p-2 flex gap-2 overflow-x-auto">
                    {remedy.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setActiveImage(index)}
                        className={cn(
                          "relative w-16 h-16 rounded overflow-hidden border-2 flex-shrink-0",
                          activeImage === index ? "border-green-600" : "border-transparent"
                        )}
                      >
                        <img 
                          src={image.image_url} 
                          alt={`${remedy.title} ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Informasi Ramuan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Wilayah</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{remedy.region}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tingkat Kepercayaan</span>
                    <TrustLevelIndicator level={remedy.trust_level || 0} showLabel={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verifikasi</span>
                    <span className="text-sm font-medium">{remedy.verification_count || 0}</span>
                  </div>
                  
                  {remedy.preparation_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Persiapan</span>
                      <span className="text-sm font-medium">{remedy.preparation_time} menit</span>
                    </div>
                  )}
                  
                  {remedy.difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Kesulitan</span>
                      <Badge variant={
                        remedy.difficulty === 'Mudah' ? 'default' :
                        remedy.difficulty === 'Sedang' ? 'secondary' : 'destructive'
                      }>
                        {remedy.difficulty}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Verifikasi Komunitas</CardTitle>
                  <CardDescription>Ramuan ini telah diverifikasi oleh komunitas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">
                      {remedy.verification_count || 0} orang telah memverifikasi ramuan ini
                    </span>
                  </div>
                  {remedy.avg_rating && remedy.avg_rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {remedy.avg_rating}/5 ({remedy.testimonial_count} testimoni)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{remedy.region}</span>
                  {remedy.category && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: remedy.category.color }}
                      >
                        {remedy.category.name}
                      </Badge>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-green-900 mb-2">{remedy.title}</h1>
                {remedy.subtitle && (
                  <p className="text-xl text-green-600 font-medium mb-4">{remedy.subtitle}</p>
                )}
                <p className="text-gray-600">{remedy.description}</p>
              </div>

              {/* Safety Warnings */}
              {remedy.safety_warnings && remedy.safety_warnings.length > 0 && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Peringatan Keamanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {remedy.safety_warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-green-50 text-green-900 border border-green-100 p-1">
                  <TabsTrigger value="recipe" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
                    <Leaf className="w-4 h-4 mr-2" />
                    Resep
                  </TabsTrigger>
                  <TabsTrigger value="benefits" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Manfaat
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Sejarah
                  </TabsTrigger>
                  <TabsTrigger value="testimonials" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1">
                    <Quote className="w-4 h-4 mr-2" />
                    Testimoni
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recipe" className="mt-6">
                  <div className="space-y-6">
                    {/* Ingredients */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-800">Bahan-bahan</CardTitle>
                        <CardDescription>
                          {remedy.servings && `Untuk ${remedy.servings} porsi`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {remedy.ingredients && remedy.ingredients.length > 0 ? (
                          <ul className="space-y-3">
                            {remedy.ingredients.map((ingredient) => (
                              <li key={ingredient.id} className="flex justify-between items-center pb-2 border-b border-green-100 last:border-b-0">
                                <div>
                                  <span className="font-medium text-green-900">{ingredient.name}</span>
                                  {ingredient.notes && (
                                    <p className="text-sm text-gray-500">({ingredient.notes})</p>
                                  )}
                                </div>
                                <span className="text-gray-600">{ingredient.amount}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-center py-4">Belum ada bahan yang tercatat</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Steps */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-800">Cara Pembuatan</CardTitle>
                        <CardDescription>Ikuti langkah-langkah berikut dengan teliti</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {remedy.steps && remedy.steps.length > 0 ? (
                          <ol className="space-y-6">
                            {remedy.steps.map((step) => (
                              <li key={step.id} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">
                                  {step.step_number}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-green-800 mb-1">{step.title}</h4>
                                  <p className="text-gray-700 mb-2">{step.description}</p>
                                  {step.tips && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-blue-800">
                                          <strong>Tips:</strong> {step.tips}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 text-center py-4">Belum ada langkah yang tercatat</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="benefits" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-800">Manfaat Kesehatan</CardTitle>
                      <CardDescription>Manfaat tradisional dan yang telah diteliti</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {remedy.benefits && remedy.benefits.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {remedy.benefits.map((benefit) => (
                            <div key={benefit.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-green-800">{benefit.benefit}</h4>
                                {benefit.description && (
                                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Belum ada manfaat yang tercatat</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-800">Sejarah dan Tradisi</CardTitle>
                      <CardDescription>Latar belakang budaya dan sejarah ramuan ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {remedy.origin_story ? (
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-600 leading-relaxed">{remedy.origin_story}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Belum ada sejarah yang tercatat</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="testimonials" className="mt-6">
                  <div className="space-y-6">
                    {/* Testimonials List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-800">Testimoni Pengguna</CardTitle>
                        <CardDescription>
                          Pengalaman dari komunitas ({testimonials.length} testimoni)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {testimonials.length > 0 ? (
                          <div className="space-y-4">
                            {testimonials.slice(0, 3).map((testimonial) => (
                              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                            ))}
                            {testimonials.length > 3 && (
                              <Button variant="outline" className="w-full border-green-200 text-green-800 hover:bg-green-50">
                                Lihat Semua Testimoni ({testimonials.length})
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">Belum ada testimoni</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Add Testimonial Form */}
                    <TestimonialForm remedyId={remedy.id} onSubmit={refreshTestimonials} />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Similar Remedies */}
              {similarRemedies.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Ramuan Serupa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarRemedies.map((similarRemedy) => (
                      <Card 
                        key={similarRemedy.id} 
                        className="border-green-100 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/remedies/${similarRemedy.id}`)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-green-800">{similarRemedy.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-gray-600">{similarRemedy.subtitle}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{similarRemedy.region}</span>
                            <TrustLevelIndicator level={similarRemedy.trust_level} showLabel={false} />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="ghost" className="p-0 h-auto text-green-600 hover:text-green-800 hover:bg-transparent">
                            Lihat Resep <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}