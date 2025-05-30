'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  MapPin, 
  Search, 
  Menu, 
  X, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  Map,
  Compass,
  BookOpen,
  Bell,
  Loader2,
  Leaf  // Added for Ancient Remedies icon
} from 'lucide-react'
import { useAuth } from '@/components/providers/Providers'
import { SearchComponent } from '@/components/search/SearchComponent'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Peta', href: '/', icon: Map, current: pathname === '/' },
    { name: 'Jelajahi', href: '/explore', icon: Compass, current: pathname === '/explore' },
    { name: 'Ramuan Nusantara', href: '/remedies', icon: Leaf, current: pathname.startsWith('/remedies') }, // New section
    // { name: 'Cerita', href: '/stories', icon: BookOpen, current: pathname === '/stories' },
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
  }

  // Helper function to get navigation item styles
  const getNavigationItemStyles = (item: any) => {
    if (item.current) {
      // Use green colors for Ramuan Nusantara, red for others
      return item.href === '/remedies' 
        ? 'text-green-600 bg-green-50'
        : 'text-indonesia-red bg-red-50'
    }
    return 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
  }

  // Helper function for mobile navigation styles
  const getMobileNavigationItemStyles = (item: any) => {
    if (item.current) {
      // Use green colors for Ramuan Nusantara, red for others
      return item.href === '/remedies'
        ? 'text-green-600 bg-green-50'
        : 'text-indonesia-red bg-red-50'
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indonesia-red rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-accent font-bold text-gray-900 hidden sm:block">
                  UnseenIndonesia
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${getNavigationItemStyles(item)}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchComponent className="w-full" />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              {user && (
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indonesia-red rounded-full"></span>
                </button>
              )}

              {/* Auth section */}
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indonesia-gold rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {profile?.full_name || profile?.username || 'User'}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Profil Saya
                          </Link>
                          
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Pengaturan
                          </Link>
                          
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4" />
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="bg-indonesia-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indonesia-deep-red transition-colors"
                >
                  Masuk
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Mobile search */}
              <div className="px-3 py-2">
                <SearchComponent 
                  className="w-full" 
                  placeholder="Cari cerita..."
                  isMobile={true}
                />
              </div>

              {/* Mobile navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${getMobileNavigationItemStyles(item)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating Action Button - Add Story or Remedy */}
      {user && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Main FAB */}
          <div className="relative group">
            <button className="w-14 h-14 bg-indonesia-red text-white rounded-full shadow-lg hover:bg-indonesia-deep-red transition-all duration-200 transform hover:scale-105 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </button>
            
            {/* Mini FABs */}
            <div className="absolute bottom-16 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 space-y-2">
              <button
                onClick={() => router.push('/stories/new')}
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center group/story"
                title="Tambah Cerita Baru"
              >
                <MapPin className="w-5 h-5" />
                <span className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/story:opacity-100 transition-opacity whitespace-nowrap">
                  Cerita Baru
                </span>
              </button>
              
              <button
                onClick={() => router.push('/remedies/new')}
                className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center group/remedy"
                title="Tambah Ramuan Baru"
              >
                <Leaf className="w-5 h-5" />
                <span className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/remedy:opacity-100 transition-opacity whitespace-nowrap">
                  Ramuan Baru
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}