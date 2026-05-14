'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

type Conversation = {
  id: string
  participant_a: { id: string; full_name: string; avatar_url: string } | null
  participant_b: { id: string; full_name: string; avatar_url: string } | null
  updated_at: string
}

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: { id: string; full_name: string; avatar_url: string } | null
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(d => {
        setConversations(d.conversations ?? [])
        setLoading(false)
      })
    // Get current user id from session
    fetch('/api/auth/session').then(r => r.json()).then(d => setCurrentUserId(d?.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!activeConvId) return
    fetch(`/api/messages?conversation_id=${activeConvId}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages ?? [])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      })
  }, [activeConvId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvId) return
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: activeConvId, content: newMessage }),
    })
    const data = await res.json()
    if (data.message) {
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/client/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden" style={{ height: '70vh' }}>
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-100 flex flex-col">
            <div className="p-3 border-b border-gray-100 font-semibold text-sm text-gray-600">Conversations</div>
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No messages yet</div>
            ) : (
              <ul className="overflow-y-auto flex-1">
                {conversations.map(conv => {
                  const other = conv.participant_a?.id === currentUserId ? conv.participant_b : conv.participant_a
                  return (
                    <li
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${
                        activeConvId === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      {other?.avatar_url && <img src={other.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />}
                      <div className="truncate">
                        <p className="font-medium text-sm text-gray-800 truncate">{other?.full_name}</p>
                        <p className="text-xs text-gray-400">{new Date(conv.updated_at).toLocaleDateString()}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {!activeConvId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === currentUserId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 font-medium"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
