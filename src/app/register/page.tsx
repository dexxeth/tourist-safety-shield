import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Create Your Tourist Safety Account</h1>
            <p className="text-muted-foreground">
              Register to get your digital tourist ID and access safety monitoring features
            </p>
          </div>
          <RegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
