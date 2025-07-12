"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import UserCard from "@/components/user-card"
import UserCardSkeleton from "@/components/user-card-skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"

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

interface ApiResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

const API_ENDPOINT = "https://tech-test.raintor.com/api/users/GetUsersList"

async function fetchUsers({ pageParam = 0 }): Promise<ApiResponse> {
  const response = await fetch(`${API_ENDPOINT}?take=10&skip=${pageParam}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export default function UserFeed() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useInfiniteQuery(
    {
      queryKey: ["users"],
      queryFn: fetchUsers,
      getNextPageParam: (lastPage, allPages) => {
        const totalFetched = allPages.reduce((sum, page) => sum + page.users.length, 0)
        return totalFetched < lastPage.total ? totalFetched : undefined
      },
      initialPageParam: 0,
    },
  )

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return

      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            setHasScrolled(true)
            fetchNextPage()
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        },
      )

      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Get all users from all pages
  const allUsers = data?.pages.flatMap((page) => page.users) ?? []
  const totalUsers = data?.pages[0]?.total ?? 0

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load users: {error instanceof Error ? error.message : "Unknown error"}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Showing {allUsers.length} of {totalUsers} users
        </span>
        <span>{hasScrolled && "Scroll to load more"}</span>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Render users */}
        {allUsers.map((user, index) => (
          <div key={`${user.id}-${index}`} ref={index === allUsers.length - 1 ? lastElementRef : null}>
            <UserCard user={user} />
          </div>
        ))}

        {/* Loading skeletons */}
        {(isLoading || isFetchingNextPage) && (
          <>
            {Array.from({ length: isLoading ? 9 : 3 }).map((_, index) => (
              <UserCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Load more indicator */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-slate-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading more users...
          </div>
        )}

        {!hasNextPage && allUsers.length > 0 && (
          <div className="text-slate-500 text-center">
            <p>🎉 You've reached the end!</p>
            <p className="text-sm">All {totalUsers} users loaded</p>
          </div>
        )}
      </div>
    </div>
  )
}
