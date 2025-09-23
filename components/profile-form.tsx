"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, DollarSign, MapPin, Cigarette, Dog, Moon, Volume2, CheckCircle } from "lucide-react"

interface ProfileData {
  name: string
  email: string
  gender: "MALE" | "FEMALE"
  budgetMin: string
  budgetMax: string
  preferredArea: string
  lifestyle: {
    smoking: boolean
    pet: boolean
    nightOwl: boolean
    quiet: boolean
  }
  contactLine: string
  contactEmail: string
}

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("2024-01-15T10:30:00Z")
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@email.com",
    gender: "MALE",
    budgetMin: "1000",
    budgetMax: "1500",
    preferredArea: "Downtown Seattle",
    lifestyle: {
      smoking: false,
      pet: false,
      nightOwl: true,
      quiet: false,
    },
    contactLine: "@johndoe_seattle",
    contactEmail: "john.doe@email.com",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Updating profile:", profileData)
      setLastUpdated(new Date().toISOString())
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLifestyleChange = (lifestyle: keyof ProfileData["lifestyle"], checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, [lifestyle]: checked },
    }))
  }

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

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/diverse-user-avatars.png" alt={profileData.name} />
                <AvatarFallback className="text-lg">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold font-space-grotesk">{profileData.name}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Form */}
        <Card>
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      disabled
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
                  onValueChange={(value) => handleInputChange("gender", value)}
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

              {/* Budget Range */}
              <div className="space-y-3">
                <Label>Budget Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin" className="text-sm">
                      Minimum
                    </Label>
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
                    <Label htmlFor="budgetMax" className="text-sm">
                      Maximum
                    </Label>
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

              {/* Lifestyle Preferences */}
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

              {/* Contact Information */}
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

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-6">
        <AlertDescription>
          Your profile information helps us match you with compatible roommates. Contact information is only shared
          after successful matches.
        </AlertDescription>
      </Alert>
    </div>
  )
}
