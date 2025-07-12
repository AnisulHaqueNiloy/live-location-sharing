"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Building, GraduationCap } from "lucide-react"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  image: string
  university: string
  company: {
    title: string
  }
}

interface UserCardProps {
  user: User
}

export default function UserCard({ user }: UserCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 h-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={fullName} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name and ID */}
            <div>
              <h3 className="font-semibold text-slate-900 truncate">{fullName}</h3>
              <Badge variant="secondary" className="text-xs">
                ID: {user.id}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={user.email}>
                  {user.email}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={user.company.title}>
                  {user.company.title}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <GraduationCap className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={user.university}>
                  {user.university}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
