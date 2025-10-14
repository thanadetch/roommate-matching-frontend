"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, DollarSign, MapPin, Cigarette, Dog, Moon, Volume2, CheckCircle } from "lucide-react"
import { profileApi, tokenStorage, jwt, ApiError } from "@/lib/api-client"

type Gender = "MALE" | "FEMALE" | ""

interface ProfileDataUI {
  id?: string
  firstName: string
  lastName: string
  email: string
  gender: Gender
  budgetMin: string
  budgetMax: string
  preferredArea: string
  lifestyle: {
    smoking: boolean
    pet: boolean        // -> petOwner
    nightOwl: boolean
    quiet: boolean      // -> quietPerson
  }
  contactLine: string
  contactEmail: string
}

export function ProfileForm() {
  const [mounted, setMounted] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<ProfileDataUI>({
    id: undefined,
    firstName: "",
    lastName: "",
    email: "",          // SSR: เว้นว่างไว้ก่อน กัน mismatch
    gender: "",
    budgetMin: "",
    budgetMax: "",
    preferredArea: "",
    lifestyle: { smoking: false, pet: false, nightOwl: false, quiet: false },
    contactLine: "",
    contactEmail: "",
  })

  // mark as mounted เพื่อกัน hydration mismatch (client-only data)
  useEffect(() => {
    setMounted(true)
  }, [])

  // โหลด token + email + โปรไฟล์จริงหลัง mount เท่านั้น
  useEffect(() => {
    let alive = true
    async function fetchProfile() {
      try {
        setServerError(null)
        const token = tokenStorage.get()
        const payload = token ? jwt.decode(token) : null
        const email = payload?.email ?? ""

        // set email ให้ UI ก่อน (client-side เท่านั้น)
        if (alive) {
          setProfileData((prev) => ({
            ...prev,
            email: email || prev.email,
            contactEmail: prev.contactEmail || email,
          }))
        }

        if (!email) {
          if (alive) setIsFetching(false)
          return
        }

        const res = await profileApi.getByEmail(email)
        const p = res?.result
        if (alive && p) {
          setProfileData({
            id: p.id,
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            email: p.email ?? email,
            gender: (p.gender as Gender) ?? "",
            budgetMin: p.budgetMin != null ? String(p.budgetMin) : "",
            budgetMax: p.budgetMax != null ? String(p.budgetMax) : "",
            preferredArea: p.preferredArea ?? "",
            lifestyle: {
              smoking: !!p.smoking,
              pet: !!p.petOwner,
              nightOwl: !!p.nightOwl,
              quiet: !!p.quietPerson,
            },
            contactLine: p.contactLine ?? "",
            contactEmail: p.contactEmail ?? (p.email ?? email),
          })
          setLastUpdated(p.updatedAt ?? p.createdAt ?? null)
        }
      } catch (err) {
        // 404 = ยังไม่มีโปรไฟล์ก็ปล่อยให้กรอก
        if (!(err instanceof ApiError && err.status === 404)) {
          setServerError(err instanceof ApiError ? err.message : "Failed to load profile")
        }
      } finally {
        if (alive) setIsFetching(false)
      }
    }

    fetchProfile()
    return () => {
      alive = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsSaving(true)
    try {
      const payload = {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        gender: profileData.gender || undefined,
        budgetMin: profileData.budgetMin ? Number(profileData.budgetMin) : undefined,
        budgetMax: profileData.budgetMax ? Number(profileData.budgetMax) : undefined,
        preferredArea: profileData.preferredArea || undefined,
        smoking: profileData.lifestyle.smoking,
        petOwner: profileData.lifestyle.pet,
        nightOwl: profileData.lifestyle.nightOwl,
        quietPerson: profileData.lifestyle.quiet,
        contactLine: profileData.contactLine || undefined,
        contactEmail: profileData.contactEmail || undefined,
      }

      if (profileData.id) {
        await profileApi.updateById(profileData.id, payload)
      } else {
        // ถ้า backend ยัง require password ใน CreateProfileDto ให้แก้ backend ให้ optional
        await profileApi.create({
          ...payload,
          password: "TEMPORARY_PASSWORD_CHANGE_ME",
        })
      }

      setShowSuccess(true)
      setLastUpdated(new Date().toISOString())
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileDataUI, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLifestyleChange = (l: keyof ProfileDataUI["lifestyle"], checked: boolean) => {
    setProfileData((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, [l]: checked } }))
  }

  const initials =
    (profileData.firstName + " " + profileData.lastName)
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("") || "U"

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-space-grotesk mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      {serverError && (
        <Alert className="mb-6 border-destructive/40 bg-destructive/10">
          <AlertDescription className="text-destructive">{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/diverse-user-avatars.png" alt={profileData.firstName || "User"} />
              {/* กัน mismatch ด้วยการแสดงหลัง mount */}
              <AvatarFallback className="text-lg">{mounted ? initials : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold font-space-grotesk">
                {mounted ? (profileData.firstName + " " + profileData.lastName).trim() || "Unnamed User" : " "}
              </h2>
              <p className="text-muted-foreground" suppressHydrationWarning>
                {mounted ? profileData.email : ""}
              </p>
              {lastUpdated && mounted && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card className={isFetching ? "opacity-60 pointer-events-none mt-6" : "mt-6"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={mounted ? profileData.email : ""}
                    className="pl-10"
                    disabled
                    suppressHydrationWarning
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup
                value={profileData.gender}
                onValueChange={(v) => handleInputChange("gender", v as Gender)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <Label>Budget Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin" className="text-sm">Minimum</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="1000"
                      value={profileData.budgetMin}
                      onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax" className="text-sm">Maximum</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="1500"
                      value={profileData.budgetMax}
                      onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Area */}
            <div className="space-y-2">
              <Label htmlFor="preferredArea">Preferred Area</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="preferredArea"
                  placeholder="e.g., Downtown Seattle, Capitol Hill"
                  value={profileData.preferredArea}
                  onChange={(e) => handleInputChange("preferredArea", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-4">
              <Label>Lifestyle Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cigarette className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="smoking">Smoking</Label>
                      <p className="text-xs text-muted-foreground">I smoke regularly</p>
                    </div>
                  </div>
                  <Switch
                    id="smoking"
                    checked={profileData.lifestyle.smoking}
                    onCheckedChange={(checked) => handleLifestyleChange("smoking", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Dog className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pet">Pet Owner</Label>
                      <p className="text-xs text-muted-foreground">I have pets</p>
                    </div>
                  </div>
                  <Switch
                    id="pet"
                    checked={profileData.lifestyle.pet}
                    onCheckedChange={(checked) => handleLifestyleChange("pet", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="nightOwl">Night Owl</Label>
                      <p className="text-xs text-muted-foreground">I stay up late</p>
                    </div>
                  </div>
                  <Switch
                    id="nightOwl"
                    checked={profileData.lifestyle.nightOwl}
                    onCheckedChange={(checked) => handleLifestyleChange("nightOwl", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="quiet">Quiet Person</Label>
                      <p className="text-xs text-muted-foreground">I prefer quiet environments</p>
                    </div>
                  </div>
                  <Switch
                    id="quiet"
                    checked={profileData.lifestyle.quiet}
                    onCheckedChange={(checked) => handleLifestyleChange("quiet", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <Label>Contact Information</Label>
              <p className="text-sm text-muted-foreground">
                This information will only be visible to matched roommates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactLine">Line ID</Label>
                  <Input
                    id="contactLine"
                    placeholder="@your_line_id"
                    value={profileData.contactLine}
                    onChange={(e) => handleInputChange("contactLine", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={profileData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" disabled={isSaving || isFetching} className="w-full md:w-auto">
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertDescription>
          Your profile information helps us match you with compatible roommates. Contact information is only shared
          after successful matches.
        </AlertDescription>
      </Alert>
    </div>
  )
}
