"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, Camera, Save, Loader2 } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface ProfileFormData {
  name: string
  email: string
  gender: string
  phone: string
  country: string
  bio: string
}

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark",
  "Finland", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Greece",
  "Portugal", "Ireland", "Australia", "New Zealand", "Japan", "South Korea", "China",
  "India", "Brazil", "Argentina", "Mexico", "Chile", "Colombia", "Peru", "Venezuela",
  "South Africa", "Egypt", "Nigeria", "Kenya", "Morocco", "Algeria", "Tunisia",
  "Russia", "Ukraine", "Belarus", "Kazakhstan", "Uzbekistan", "Azerbaijan", "Georgia",
  "Armenia", "Turkey", "Iran", "Iraq", "Saudi Arabia", "UAE", "Qatar", "Kuwait",
  "Bahrain", "Oman", "Yemen", "Jordan", "Lebanon", "Syria", "Israel", "Palestine"
].sort()

export default function ProfileSetupForm() {
  const [form, setForm] = useState<ProfileFormData>({
    name: "",
    email: "",
    gender: "",
    phone: "",
    country: "",
    bio: ""
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        router.push("/auth")
        return
      }

      // Fetch existing profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (profile) {
        setUser(profile as unknown as UserType)
        setForm({
          name: (profile.name as string) || "",
          email: (profile.email as string) || authUser.email || "",
          gender: (profile.gender as string) || "",
          phone: (profile.phone as string) || "",
          country: (profile.country as string) || "",
          bio: (profile.bio as string) || ""
        })
        setAvatarUrl((profile.avatar_url as string) || "")
      } else {
        // Set default values for new user
        setForm({
          name: authUser.email?.split("@")[0] || "",
          email: authUser.email || "",
          gender: "",
          phone: "",
          country: "",
          bio: ""
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        router.push("/auth")
        return
      }

      // Validate required fields
      if (!form.name.trim()) {
        throw new Error("Username is required")
      }

      if (!form.email.trim()) {
        throw new Error("Email is required")
      }

      // Update or create profile
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          name: form.name.trim(),
          email: form.email.trim(),
          gender: form.gender.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          bio: form.bio.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (upsertError) throw upsertError

      toast({
        title: "Profile saved!",
        description: "Your profile has been successfully updated.",
      })

      // Redirect to profile page or dashboard
      router.push("/profile")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <User className="h-12 w-12 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-300">
              Set up your gaming profile to get started with tracking your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt="Profile" />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {form.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                      disabled={loading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Username *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                  <Select value={form.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="country" className="text-gray-300">Country</Label>
                  <Select value={form.country} onValueChange={(value) => handleSelectChange("country", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself and your gaming interests..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 