"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { useState } from "react"

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("english")

  const languages = [
    { code: "english", name: "English", native: "English" },
    { code: "hindi", name: "Hindi", native: "हिन्दी" },
    { code: "marathi", name: "Marathi", native: "मराठी" },
    { code: "gujarati", name: "Gujarati", native: "ગુજરાતી" },
    { code: "bengali", name: "Bengali", native: "বাংলা" },
    { code: "tamil", name: "Tamil", native: "தமிழ்" },
    { code: "telugu", name: "Telugu", native: "తెలుగు" },
    { code: "kannada", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "malayalam", name: "Malayalam", native: "മലയാളം" },
    { code: "punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "urdu", name: "Urdu", native: "اردو" },
  ]

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    const language = languages.find((lang) => lang.code === languageCode)
    alert(
      `Language changed to ${language?.name} (${language?.native})\n\nThe interface will be updated to reflect your language preference.`,
    )
  }

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span>{language.name}</span>
              <span className="text-muted-foreground text-sm">({language.native})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
