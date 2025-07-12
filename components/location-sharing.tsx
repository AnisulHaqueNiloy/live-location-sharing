"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useSignalR } from "@/hooks/use-signalr";
import LocationMap from "@/components/location-map";
import {
  MapPin,
  Send,
  Wifi,
  WifiOff,
  User,
  Clock,
  Navigation,
} from "lucide-react";

const SIGNALR_HUB_URL = "https://tech-test.raintor.com/Hub";

export default function LocationSharing() {
  const [userName, setUserName] = useState("");
  const [currentLat, setCurrentLat] = useState("");
  const [currentLon, setCurrentLon] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const {
    isConnected,
    sendLocation,
    receivedLocations,
    connectionError,
    isConnecting,
  } = useSignalR(SIGNALR_HUB_URL);

  console.log("LocationSharing component render:");
  console.log("  isConnected:", isConnected);
  console.log("  isConnecting:", isConnecting);
  console.log("  connectionError:", connectionError);
  console.log("  isSending:", isSending);
  console.log("  Button disabled state:", !isConnected || isSending);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(position.coords.latitude.toString());
        setCurrentLon(position.coords.longitude.toString());
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Send location
  const handleSendLocation = async () => {
    if (!userName.trim()) {
      alert("Please enter your email/username");
      return;
    }

    if (!currentLat || !currentLon) {
      alert("Please get your current location first");
      return;
    }

    const lat = Number.parseFloat(currentLat);
    const lon = Number.parseFloat(currentLon);

    if (isNaN(lat) || isNaN(lon)) {
      alert("Invalid coordinates");
      return;
    }

    setIsSending(true);
    try {
      await sendLocation(lat, lon, userName.trim());
    } catch (error) {
      console.error("Failed to send location:", error);
      alert("Failed to send location. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <Badge
                variant="outline"
                className="text-green-700 border-green-200"
              >
                Connected
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <Badge variant="outline" className="text-red-700 border-red-200">
                {isConnecting ? "Connecting..." : "Disconnected"}
              </Badge>
            </>
          )}
        </div>
        <div className="text-sm text-slate-500">
          {receivedLocations.length} locations received
        </div>
      </div>

      {connectionError && (
        <Alert>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User A: Send Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Location (User A)
            </CardTitle>
            <CardDescription>
              Share your GPS coordinates in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Email/Username</Label>
              <Input
                id="userName"
                type="email"
                placeholder="your.email@example.com"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="25.73736464"
                  value={currentLat}
                  onChange={(e) => setCurrentLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="90.3644747"
                  value={currentLon}
                  onChange={(e) => setCurrentLon(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2 bg-transparent"
              >
                <Navigation className="w-4 h-4" />
                {isGettingLocation
                  ? "Getting Location..."
                  : "Get Current Location"}
              </Button>
              <Button
                onClick={handleSendLocation}
                disabled={!isConnected || isSending}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? "Sending..." : "Send Location"}
              </Button>
            </div>

            {locationError && (
              <Alert>
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* User B: Receive Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Received Locations (User B)
            </CardTitle>
            <CardDescription>Live updates from other users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {receivedLocations.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No locations received yet</p>
                  <p className="text-sm">Waiting for location updates...</p>
                </div>
              ) : (
                receivedLocations.map((location, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">
                          {location.userName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Just now
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Lat:</span>{" "}
                        {location.lat.toFixed(6)}
                      </div>
                      <div>
                        <span className="text-slate-500">Lon:</span>{" "}
                        {location.lon.toFixed(6)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Map Display */}
      <Card>
        <CardHeader>
          <CardTitle>Live Location Map</CardTitle>
          <CardDescription>
            Real-time visualization of all shared locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationMap
            locations={receivedLocations}
            currentLocation={
              currentLat && currentLon
                ? {
                    lat: Number.parseFloat(currentLat),
                    lon: Number.parseFloat(currentLon),
                  }
                : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
