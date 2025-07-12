"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LocationSharing from "@/components/location-sharing"
import UserFeed from "@/components/user-feed"
import { MapPin, Users, Wifi } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Raintor Technical Assessment</h1>
          <p className="text-slate-600 text-lg">Real-time Location Sharing & Infinite Scroll User Feed</p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="location" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Real-Time Location
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-500" />
                  SignalR Location Sharing
                </CardTitle>
                <CardDescription>
                  Real-time GPS coordinate sharing between users using SignalR WebSocket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationSharing />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Infinite Scroll User Feed
                </CardTitle>
                <CardDescription>Paginated user list with infinite scrolling and virtualization</CardDescription>
              </CardHeader>
              <CardContent>
                <UserFeed />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
