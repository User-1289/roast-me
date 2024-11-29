'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, X } from 'lucide-react'

interface UserInfo {
  name: string
  age: string
  bio: string
}

export function UserInfoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userInfo')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return { name: '', age: '', bio: '' }
  })

  useEffect(() => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }, [userInfo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    console.log('User info submitted and saved:', userInfo)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        className="fixed left-4 top-4 rounded-full w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle />
      </Button>
      {isOpen && (
        <div className="fixed left-4 top-20 w-80 bg-gray-800 rounded-lg shadow-lg p-4 text-gray-100">
          <Button
            className="absolute top-2 right-2 bg-transparent hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold mb-4">Tell us about yourself</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Name"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-orange-500"
            />
            <Input
              type="number"
              placeholder="Age"
              value={userInfo.age}
              onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-orange-500"
            />
            <Textarea
              placeholder="Bio (give us something to roast!)"
              value={userInfo.bio}
              onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-orange-500"
            />
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              Bring on the Roast!
            </Button>
          </form>
        </div>
      )}
    </>
  )
}

