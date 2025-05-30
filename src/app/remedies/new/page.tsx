'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/components/providers/Providers'
import { createSupabaseClient } from '@/lib/supabase'
import type { RemedyCategory, CreateRemedyFormData } from '@/types/database'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface IngredientForm {
  name: string
  amount: string
  notes: string
  is_main_ingredient: boolean
}

interface StepForm {
  title: string
  description: string
  tips: string
  estimated_time?: number
}

interface BenefitForm {
  benefit: string
  description: string
  category: string
}

const difficultyOptions = [
  { value: 'Mudah', label: 'Mudah' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Sulit', label: 'Sulit' }
]

const regions = [
  'Jawa Tengah', 'Jawa Timur', 'Jawa Barat', 'DKI Jakarta', 'Banten',
  'DI Yogyakarta', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Bengkulu',
  'Jambi', 'Lampung', 'Riau', 'Kepulauan Riau', 'Bangka Belitung',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
  'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan',
  'Papua Barat Daya'
]

export default function NewRemedyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<RemedyCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [region, setRegion] = useState('')
  const [originStory, setOriginStory] = useState('')
  const [preparationTime, setPreparationTime] = useState<number | undefined>()
  const [cookingTime, setCookingTime] = useState<number | undefined>()
  const [servings, setServings] = useState<number | undefined>()
  const [difficulty, setDifficulty] = useState<string>('Sedang')
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([''])
  const [contraindications, setContraindications] = useState<string[]>([''])
  
  const [ingredients, setIngredients] = useState<IngredientForm[]>([
    { name: '', amount: '', notes: '', is_main_ingredient: true }
  ])
  const [steps, setSteps] = useState<StepForm[]>([
    { title: '', description: '', tips: '' }
  ])
  const [benefits, setBenefits] = useState<BenefitForm[]>([
    { benefit: '', description: '', category: 'kesehatan' }
  ])

  const supabase = createSupabaseClient()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/remedies/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', notes: '', is_main_ingredient: false }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string | boolean) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    setIngredients(updated)
  }

  const addStep = () => {
    setSteps([...steps, { title: '', description: '', tips: '' }])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: keyof StepForm, value: string | number) => {
    const updated = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    )
    setSteps(updated)
  }

  const addBenefit = () => {
    setBenefits([...benefits, { benefit: '', description: '', category: 'kesehatan' }])
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const updateBenefit = (index: number, field: keyof BenefitForm, value: string) => {
    const updated = benefits.map((benefit, i) => 
      i === index ? { ...benefit, [field]: value } : benefit
    )
    setBenefits(updated)
  }

  const addWarning = () => {
    setSafetyWarnings([...safetyWarnings, ''])
  }

  const removeWarning = (index: number) => {
    setSafetyWarnings(safetyWarnings.filter((_, i) => i !== index))
  }

  const updateWarning = (index: number, value: string) => {
    const updated = safetyWarnings.map((warning, i) => 
      i === index ? value : warning
    )
    setSafetyWarnings(updated)
  }

  const addContraindication = () => {
    setContraindications([...contraindications, ''])
  }

  const removeContraindication = (index: number) => {
    setContraindications(contraindications.filter((_, i) => i !== index))
  }

  const updateContraindication = (index: number, value: string) => {
    const updated = contraindications.map((contra, i) => 
      i === index ? value : contra
    )
    setContraindications(updated)
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return title && description && categoryId && region
      case 2:
        return ingredients.some(ing => ing.name && ing.amount)
      case 3:
        return steps.some(step => step.title && step.description)
      case 4:
        return benefits.some(benefit => benefit.benefit)
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const formData: CreateRemedyFormData = {
          title,
          subtitle: subtitle || undefined,
          description,
          summary: summary || undefined,
          category_id: categoryId,
          region,
          origin_story: originStory || undefined,
          preparation_time: preparationTime,
          cooking_time: cookingTime,
          servings,
          difficulty: difficulty as any,
          safety_warnings: safetyWarnings.filter(w => w.trim()),
          contraindications: contraindications.filter(c => c.trim()),
          ingredients: [],
          steps: [],
          benefits: []
      }

      const response = await fetch('/api/remedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/remedies/${data.remedy.id}`)
      } else {
        const error = await response.json()
        console.error('Error creating remedy:', error)
      }
    } catch (error) {
      console.error('Error creating remedy:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Silakan Masuk Dulu</h1>
            <p className="text-gray-600 mb-4">Anda perlu masuk untuk menambahkan ramuan baru</p>
            <Button onClick={() => router.push('/auth')} className="bg-green-600 hover:bg-green-700">
              Masuk
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
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/remedies')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Kembali ke Ramuan</span>
              </button>
              
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-green-600 text-white'
                        : step < currentStep
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-900 mb-2">Tambah Ramuan Baru</h1>
            <p className="text-gray-600">Bagikan pengetahuan tradisional Anda dengan komunitas</p>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Informasi Dasar</CardTitle>
                <CardDescription>Berikan informasi dasar tentang ramuan ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Nama Ramuan *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Jamu Kunyit Asam"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Ramuan Tradisional untuk Kesehatan Wanita"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan ramuan ini, kegunaannya, dan latar belakang tradisionalnya..."
                    className="mt-1 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Ringkasan</Label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Ringkasan singkat untuk tampilan kartu..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Kategori *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Wilayah *</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih wilayah" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((regionName) => (
                          <SelectItem key={regionName} value={regionName}>
                            {regionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="prep-time">Waktu Persiapan (menit)</Label>
                    <Input
                      id="prep-time"
                      type="number"
                      value={preparationTime || ''}
                      onChange={(e) => setPreparationTime(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="15"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cook-time">Waktu Memasak (menit)</Label>
                    <Input
                      id="cook-time"
                      type="number"
                      value={cookingTime || ''}
                      onChange={(e) => setCookingTime(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tingkat Kesulitan</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="origin">Cerita Asal-usul</Label>
                  <Textarea
                    id="origin"
                    value={originStory}
                    onChange={(e) => setOriginStory(e.target.value)}
                    placeholder="Ceritakan sejarah atau asal-usul ramuan ini..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Ingredients */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Bahan-bahan</CardTitle>
                <CardDescription>Daftarkan semua bahan yang dibutuhkan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Bahan {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={ingredient.is_main_ingredient ? 'default' : 'outline'}>
                            {ingredient.is_main_ingredient ? 'Bahan Utama' : 'Bahan Tambahan'}
                          </Badge>
                          {ingredients.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredient(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Nama Bahan</Label>
                          <Input
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            placeholder="Kunyit segar"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Jumlah</Label>
                          <Input
                            value={ingredient.amount}
                            onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                            placeholder="200 gram"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Catatan</Label>
                          <Input
                            value={ingredient.notes}
                            onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                            placeholder="cuci bersih, kupas"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={ingredient.is_main_ingredient}
                            onChange={(e) => updateIngredient(index, 'is_main_ingredient', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Bahan utama</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={addIngredient}
                  variant="outline"
                  className="w-full mt-4 border-green-200 text-green-800 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Bahan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Steps */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Langkah Pembuatan</CardTitle>
                <CardDescription>Jelaskan cara membuat ramuan ini langkah demi langkah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Langkah {index + 1}</h4>
                        {steps.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Judul Langkah</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            placeholder="Persiapan Bahan"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            placeholder="Jelaskan apa yang harus dilakukan pada langkah ini..."
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Tips (opsional)</Label>
                            <Input
                              value={step.tips}
                              onChange={(e) => updateStep(index, 'tips', e.target.value)}
                              placeholder="Tips untuk hasil terbaik..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Estimasi Waktu (menit)</Label>
                            <Input
                              type="number"
                              value={step.estimated_time || ''}
                              onChange={(e) => updateStep(index, 'estimated_time', e.target.value ? parseInt(e.target.value) : 0)}
                              placeholder="5"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={addStep}
                  variant="outline"
                  className="w-full mt-4 border-green-200 text-green-800 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Langkah
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Benefits */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Manfaat Kesehatan</CardTitle>
                <CardDescription>Sebutkan manfaat kesehatan dari ramuan ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Manfaat {index + 1}</h4>
                        {benefits.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBenefit(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Manfaat</Label>
                          <Input
                            value={benefit.benefit}
                            onChange={(e) => updateBenefit(index, 'benefit', e.target.value)}
                            placeholder="Anti-inflamasi"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Kategori</Label>
                          <Select 
                            value={benefit.category} 
                            onValueChange={(value) => updateBenefit(index, 'category', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kesehatan">Kesehatan</SelectItem>
                              <SelectItem value="kecantikan">Kecantikan</SelectItem>
                              <SelectItem value="pencernaan">Pencernaan</SelectItem>
                              <SelectItem value="imunitas">Imunitas</SelectItem>
                              <SelectItem value="perawatan">Perawatan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={benefit.description}
                          onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                          placeholder="Jelaskan bagaimana ramuan ini memberikan manfaat tersebut..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={addBenefit}
                  variant="outline"
                  className="w-full mt-4 border-green-200 text-green-800 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Manfaat
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Safety & Warnings */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Keamanan dan Peringatan
                </CardTitle>
                <CardDescription>
                  Informasi penting tentang keamanan penggunaan ramuan ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Peringatan Keamanan</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Daftarkan hal-hal yang perlu diperhatikan saat menggunakan ramuan ini
                  </p>
                  <div className="space-y-2">
                    {safetyWarnings.map((warning, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={warning}
                          onChange={(e) => updateWarning(index, e.target.value)}
                          placeholder="Tidak dianjurkan untuk ibu hamil"
                          className="flex-1"
                        />
                        {safetyWarnings.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWarning(index)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addWarning}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-yellow-200 text-yellow-800 hover:bg-yellow-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Peringatan
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Kontraindikasi</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Kondisi atau situasi dimana ramuan ini tidak boleh digunakan
                  </p>
                  <div className="space-y-2">
                    {contraindications.map((contra, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={contra}
                          onChange={(e) => updateContraindication(index, e.target.value)}
                          placeholder="Gangguan pembekuan darah"
                          className="flex-1"
                        />
                        {contraindications.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContraindication(index)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addContraindication}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-200 text-red-800 hover:bg-red-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kontraindikasi
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Disclaimer Penting</p>
                      <p>
                        Informasi yang Anda berikan akan membantu pengguna lain menggunakan ramuan ini dengan aman. 
                        Pastikan informasi yang diberikan akurat dan berdasarkan pengetahuan atau pengalaman yang valid.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Sebelumnya
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="bg-green-600 hover:bg-green-700"
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Ramuan'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}