'use client'

import { useState, useEffect, useMemo, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, MapPin, Star, Leaf, ChevronDown, Loader2, Heart, Droplets, Sun, Shield, Zap, X } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { createSupabaseClient } from '@/lib/supabase'
import type { RemedyWithDetails, RemedyCategory, RemedyFilters, RemedySortOption } from '@/types/database'

// We'll need these shadcn components - install them if missing
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

interface Region {
  region: string
  remedy_count: number
}

const difficultyOptions = [
  { value: 'Mudah', label: 'Mudah', color: 'bg-green-100 text-green-800' },
  { value: 'Sedang', label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Sulit', label: 'Sulit', color: 'bg-red-100 text-red-800' }
]

const sortOptions: { value: RemedySortOption; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'trust_level', label: 'Tingkat Kepercayaan' },
  { value: 'verification_count', label: 'Paling Terverifikasi' },
  { value: 'popularity', label: 'Populer' },
  { value: 'alphabetical', label: 'A-Z' }
]

function TrustLevelIndicator({ level }: { level: number }) {
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
    <div className="flex items-center gap-1">
      <div className={`flex ${getTrustColor(level)}`}>
        {Array.from({ length: Math.min(level, 5) }).map((_, i) => (
          <Star key={i} className="h-3 w-3" />
        ))}
      </div>
      <span className="text-xs text-gray-500">{getTrustLabel(level)}</span>
    </div>
  )
}

function CategoryIcon({ iconName }: { iconName: string }) {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    heart: Heart,
    droplets: Droplets,
    sun: Sun,
    shield: Shield,
    zap: Zap,
    leaf: Leaf
  }
  
  const IconComponent = iconMap[iconName] || Leaf
  return <IconComponent className="w-4 h-4" />
}

function RemedyCard({ remedy }: { remedy: RemedyWithDetails }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/remedies/${remedy.id}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group" onClick={handleClick}>
      <div className="relative h-48 w-full bg-gradient-to-br from-green-100 to-emerald-200">
        {remedy.primary_image ? (
          <img 
            src={remedy.primary_image} 
            alt={remedy.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-16 h-16 text-green-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className="flex items-center gap-1"
            style={{ backgroundColor: remedy.category?.color || '#10B981', color: 'white' }}
          >
            {remedy.category?.icon && <CategoryIcon iconName={remedy.category.icon} />}
            {remedy.category?.name}
          </Badge>
        </div>

        {/* Trust Level */}
        <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1">
          <TrustLevelIndicator level={remedy.trust_level || 0} />
        </div>

        {/* Verification Count */}
        {(remedy.verification_count || 0) > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {remedy.verification_count} verifikasi
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
            {remedy.title}
          </h3>
        </div>
        
        {remedy.subtitle && (
          <p className="text-green-600 font-medium text-sm mb-2">{remedy.subtitle}</p>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{remedy.summary || remedy.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-green-600" />
          <span>{remedy.region}</span>
          {remedy.difficulty && (
            <>
              <span className="mx-2">•</span>
              <Badge variant="outline" className={
                remedy.difficulty === 'Mudah' ? 'bg-green-50 text-green-700' :
                remedy.difficulty === 'Sedang' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }>
                {remedy.difficulty}
              </Badge>
            </>
          )}
        </div>
        
        {remedy.main_ingredients && remedy.main_ingredients.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Bahan Utama:</h4>
            <div className="flex flex-wrap gap-1">
              {remedy.main_ingredients.slice(0, 3).map((ingredient: any, index: number) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs">
                  <Leaf className="w-3 h-3 mr-1" />
                  {ingredient.name}
                </Badge>
              ))}
              {remedy.main_ingredients.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{remedy.main_ingredients.length - 3} lainnya
                </span>
              )}
            </div>
          </div>
        )}
        
        <Separator className="my-3" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {remedy.preparation_time && (
              <span>⏱ {remedy.preparation_time} menit</span>
            )}
            {remedy.avg_rating && remedy.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {remedy.avg_rating}
              </span>
            )}
          </div>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            Lihat Resep
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<RemedyWithDetails[]>([])
  const [categories, setCategories] = useState<RemedyCategory[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [sortBy, setSortBy] = useState<RemedySortOption>('newest')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const supabase = createSupabaseClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadRemedies()
  }, [searchQuery, selectedRegion, selectedCategories, selectedDifficulty, sortBy, activeTab, page])

  const loadInitialData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('remedy_categories')
        .select('*')
        .order('name')

      // Load regions
      const regionsResponse = await fetch('/api/remedies/regions')
      const regionsData = await regionsResponse.json()

      setCategories(categoriesData || [])
      setRegions(regionsData.regions || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadRemedies = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedRegion) params.append('region', selectedRegion)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(cat => params.append('category_id', cat))
      }
      if (activeTab === 'featured') params.append('featured', 'true')

      const response = await fetch(`/api/remedies?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRemedies(data.remedies || [])
        setTotalCount(data.total_count || 0)
        setHasNextPage(data.has_next_page || false)
      } else {
        console.error('Failed to load remedies:', data.error)
        setRemedies([])
      }
    } catch (error) {
      console.error('Error loading remedies:', error)
      setRemedies([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
    setPage(1) // Reset to first page
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedRegion('')
    setSelectedCategories([])
    setSelectedDifficulty('')
    setPage(1)
  }

  const hasActiveFilters = searchQuery || selectedRegion || selectedCategories.length > 0 || selectedDifficulty

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-4">
                Ramuan Kuno Nusantara
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-6 max-w-3xl mx-auto">
                Jelajahi warisan pengobatan tradisional Indonesia yang telah diwariskan turun-temurun
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  <span>{totalCount} Ramuan Tradisional</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Dari Seluruh Nusantara</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Terverifikasi Komunitas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filter</h3>
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Kategori</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          className="border-green-200 data-[state=checked]:bg-green-600"
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="flex flex-1 items-center justify-between text-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={category.icon} />
                            <span>{category.name}</span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Region */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Wilayah</h4>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Wilayah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Wilayah</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region.region} value={region.region}>
                          {region.region} ({region.remedy_count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                {/* Difficulty */}
                <div>
                  <h4 className="font-medium mb-3">Tingkat Kesulitan</h4>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tingkat</SelectItem>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Search and Sort */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari ramuan atau bahan..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(value: RemedySortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-white border">
                  <TabsTrigger value="all" className="flex-1">
                    Semua Ramuan
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="flex-1">
                    Unggulan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : remedies.length > 0 ? (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {remedies.map((remedy) => (
                          <RemedyCard key={remedy.id} remedy={remedy} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <p className="text-sm text-gray-600">
                          Menampilkan <span className="font-medium">{remedies.length}</span> dari{' '}
                          <span className="font-medium">{totalCount}</span> ramuan
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                          >
                            Sebelumnya
                          </Button>
                          <span className="text-sm text-gray-600 px-3">
                            Halaman {page}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasNextPage}
                            onClick={() => setPage(page + 1)}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak ada ramuan ditemukan
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Coba ubah kata kunci pencarian atau filter yang dipilih
                      </p>
                      {hasActiveFilters && (
                        <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">
                          Hapus Semua Filter
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}