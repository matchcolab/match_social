import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Handshake, Shield, Star, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-6xl lg:text-7xl">
              Match <span className="text-primary">Colab</span>
            </h1>
            <p className="mt-6 text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              A community-first networking platform where meaningful connections grow through 
              authentic conversations, shared experiences, and trusted introductions.
            </p>
            <div className="mt-10 space-y-4">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/signup'}
              >
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="text-center">
                <p className="text-secondary">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary font-semibold"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Sign in
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              How We Build Connections
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Our unique approach helps you form genuine relationships through structured engagement and community trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Daily Prompts</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Share authentic stories and perspectives through thoughtfully crafted daily questions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Interest Groups</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Connect with like-minded people in focused communities based on shared interests and life stages.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Warm Introductions</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  Request facilitated introductions with context and shared interests to start meaningful conversations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Trust & Safety</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  AI-powered moderation and community verification ensure a safe, authentic environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Join a Thriving Community
            </h2>
            <p className="text-xl text-secondary">
              Real connections happening every day
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,847</div>
              <div className="text-secondary">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">458</div>
              <div className="text-secondary">Daily Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">127</div>
              <div className="text-secondary">Successful Introductions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">23</div>
              <div className="text-secondary">Active Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-slate-700 font-medium mb-6 leading-relaxed">
                "Match Colab helped me find genuine friends who share my values. The introduction system 
                makes connecting feel natural and safe, not forced or awkward like other platforms."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SC</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Sarah C.</div>
                  <div className="text-secondary text-sm">Product Designer, Member since 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Meaningful Connections?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of authentic people looking for genuine friendships and relationships.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-blue-50"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Match Colab</h3>
            <p className="text-slate-300 mb-4">Community-first networking</p>
            <div className="text-slate-400 text-sm">
              © 2024 Match Colab. Building authentic connections.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
