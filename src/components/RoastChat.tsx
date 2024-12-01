'use client'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Flame, Zap } from 'lucide-react'
import { UserInfoPopup } from './UserInfoPopup'

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    response?: {
      text?: {
        value: string;
      };
    };
  };
  error?: string;
}

export default function RoastMeBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hey there, sunshine! Ready to get roasted? Don't worry, I'll try not to burn you too badly... or will I? 😈" }
  ])
  const [input, setInput] = useState('')
  const [userInfo, setUserInfo] = useState<{ name: string; age: string; bio: string } | null>(null)

  async function loadThread(){
    const response = await fetch('/api/load_thread')
    let data = await response.json()
    console.log(data)
    if(data.length === 0){
      return
    }
    data = data.reverse()
    console.log(data)
    let loadedMsgs = data.map((msg: any) => {
      let roleInside = msg.role
      if(roleInside === 'assistant'){
        roleInside = 'bot'
      }
      let obj = {
        role: roleInside,
        content: msg.content[0].text.value
      }
      return obj
    })

    setMessages(loadedMsgs)
  }
  useEffect(()=>{
    loadThread()
  }, [])


  const handleMessageSubmit = async (userMessage: string) => {
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage) return;
  
    const userMessageObj: Message = { role: 'user', content: trimmedMessage };
    setMessages((prevMessages) => [...prevMessages, userMessageObj]);
  
    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          //userInfo: userInfo
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data?.success) {
        throw new Error(data.error || 'Unexpected response structure.');
      }
  
      const botMessage: Message = {
        role: 'bot',
        content: data.data?.response?.text?.value || 'Sorry, I could not process your request.',
      };
  
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error in handleMessageSubmit:', error);
  
      const errorMessage: Message = {
        role: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="p-4 bg-gray-800 text-center relative overflow-hidden">
        <h1 className="text-2xl font-bold relative">Roast Me</h1>
      </header>
      <ScrollArea className="flex-grow p-4 space-y-4 relative">
        <div className="absolute inset-0 bg-gray-800 opacity-50" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'} relative`}>
              {message.role === 'bot' && (
                <Flame className="absolute -top-2 -left-2 w-4 h-4 text-orange-500" />
              )}
              <p>{message.content}</p>
              <div className="absolute inset-0 bg-black opacity-10 rounded-lg" style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)'
              }}></div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={(event)=> {event.preventDefault(); handleMessageSubmit(input); setInput("")}} className="p-4 bg-gray-800 flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Give it your best shot..."
          className="flex-grow bg-gray-700 text-gray-100 border-gray-600 focus:border-orange-500"
        />
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          <Zap className="w-4 h-4 mr-2" />
          Roast Me!
        </Button>
      </form>
      <UserInfoPopup />
    </div>
  )
}

