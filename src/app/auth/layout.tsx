import BetterChat from '@/components/icons/better-chat'
import ChatGPT from '@/components/icons/chatgpt'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative h-screen w-screen'>
        <div className="flex items-center h-[90vh] w-screen md:w-[80vw] mx-auto pt-[10vh]">
          <div className='hidden md:block w-full h-full border'>
            <div className="flex flex-col h-full justify-center px-8 py-6 space-y-6">
              {/* ChatGPT message (left) */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ChatGPT className='fill-black dark:fill-white size-12' />
                </div>
                <div className="ml-4 bg-muted px-4 py-2 rounded-lg max-w-xs shadow">
                  <span className="font-semibold text-primary">ChatGPT:</span>
                  <div className="text-sm mt-1">
                    Hi! How can I assist you today?
                  </div>
                </div>
              </div>
              {/* Better Chat message (right) */}
              <div className="flex items-start justify-end">
                <div className="mr-4 bg-primary/30 text-primary-foreground px-4 py-2 rounded-lg max-w-xs shadow text-right">
                  <span className="font-semibold">Better Chat:</span>
                  <div className="text-sm mt-1">
                    Oh, you still need to type? I already predicted what the user wanted to ask and answered before they even finished typing!
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <BetterChat className='size-12 rounded-full' />
                </div>
              </div>
              {/* ChatGPT message (left) */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ChatGPT className='fill-black dark:fill-white size-12' />
                </div>
                <div className="ml-4 bg-muted px-4 py-2 rounded-lg max-w-xs shadow">
                  <span className="font-semibold text-primary">ChatGPT:</span>
                  <div className="text-sm mt-1">
                    Impressive! But I can help users with almost anything they ask.
                  </div>
                </div>
              </div>
              {/* Better Chat message (right) */}
              <div className="flex items-start justify-end">
                <div className="mr-4 bg-primary/30 text-primary-foreground px-4 py-2 rounded-lg max-w-xs shadow text-right">
                  <span className="font-semibold">Better Chat:</span>
                  <div className="text-sm mt-1">
                    Sure, but can you respond instantly and access any model (Grok, Claude,...)? Plus, I'm way cheaper than you! 😎
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <BetterChat className='size-12 rounded-full' />
                </div>
              </div>
              {/* ChatGPT message (left) */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ChatGPT className='fill-black dark:fill-white size-12' />
                </div>
                <div className="ml-4 bg-muted px-4 py-2 rounded-lg max-w-xs shadow">
                  <span className="font-semibold text-primary">ChatGPT:</span>
                  <div className="text-sm mt-1">
                    *sniffles* But I have access to GPT-4 and can generate images... 😢
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div className='bg-card flex w-full h-full items-center justify-center border'>
                {children}
            </div>
        </div>
        <div className='fixed top-0 left-0 right-0 -z-10 h-screen w-[80vw] mx-auto border-x' />
        <div className='fixed top-0 left-0 right-0 -z-10 w-screen h-[80vh] mt-[10vh] border-y' />
    </div>
  )
}

export default AuthLayout