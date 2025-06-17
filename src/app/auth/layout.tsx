import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative h-screen w-screen'>
        <div className="flex items-center h-[90vh] w-[80vw] mx-auto pt-[10vh]">
            <div className='hidden md:block w-full h-full border'>
                <Image
                    src="https://loyal-deer-588.convex.cloud/api/storage/60645c08-4454-4ecb-bdd3-7a6e28e82d15"
                    alt="Better Chat"
                    width={800}
                    height={400}
                    className='w-full h-full object-cover'
                />
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