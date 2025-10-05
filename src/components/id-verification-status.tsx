"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Upload, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface VerificationStep {
  id: string
  title: string
  description: string
  status: "completed" | "pending" | "failed"
  required: boolean
}

export function IDVerificationStatus() {
  const { user } = useAuth()

  if (!user) return null

  const verificationSteps: VerificationStep[] = [
    {
      id: "documents",
      title: "Identity Documents",
      description: "Upload and verify your identity documents",
      status: user.isVerified ? "completed" : "pending",
      required: true,
    },
    {
      id: "biometric",
      title: "Biometric Verification",
      description: "Complete facial recognition verification",
      status: user.isVerified ? "completed" : "pending",
      required: true,
    },
    {
      id: "background",
      title: "Background Check",
      description: "Security clearance and background verification",
      status: user.isVerified ? "completed" : "pending",
      required: true,
    },
    {
      id: "emergency",
      title: "Emergency Contacts",
      description: "Verify emergency contact information",
      status: "completed",
      required: true,
    },
  ]

  const completedSteps = verificationSteps.filter((step) => step.status === "completed").length
  const totalSteps = verificationSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500 text-white">Failed</Badge>
      default:
        return <Badge variant="secondary">Not Started</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ID Verification Status</span>
          <Badge variant={user.isVerified ? "default" : "secondary"} className={user.isVerified ? "bg-green-500" : ""}>
            {user.isVerified ? "Verified" : "Pending"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="font-medium">
              {completedSteps}/{totalSteps} Steps Completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Verification Steps */}
        <div className="space-y-4">
          {verificationSteps.map((step) => (
            <div key={step.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{step.title}</h4>
                  {getStatusBadge(step.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                {step.status === "pending" && (
                  <Button size="sm" variant="outline" className="bg-transparent">
                    {step.id === "documents" && <Upload className="h-4 w-4 mr-2" />}
                    {step.id === "biometric" && <FileText className="h-4 w-4 mr-2" />}
                    {step.id === "background" && <Clock className="h-4 w-4 mr-2" />}
                    {step.id === "emergency" && <CheckCircle className="h-4 w-4 mr-2" />}
                    {step.id === "documents" && "Upload Documents"}
                    {step.id === "biometric" && "Start Verification"}
                    {step.id === "background" && "In Progress"}
                    {step.id === "emergency" && "Completed"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        {!user.isVerified && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Next Steps</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Complete all verification steps to activate your digital tourist ID and access full safety features.
            </p>
            <Button size="sm" className="w-full">
              Continue Verification
            </Button>
          </div>
        )}

        {/* Verification Benefits */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Verification Benefits</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enhanced safety monitoring and alerts</li>
            <li>• Priority emergency response</li>
            <li>• Access to restricted tourist areas</li>
            <li>• Faster check-in at hotels and attractions</li>
            <li>• Official government recognition</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
