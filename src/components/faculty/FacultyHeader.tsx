'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface FacultyHeaderProps {
  onMenuClick: () => void
}

export default function FacultyHeader({ onMenuClick }: FacultyHeaderProps) {
  return (
    <header className="bg-white shadow-sm lg:fixed lg:w-full lg:top-0 lg:z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <div className="ml-4 lg:ml-0">
              <Link href="/faculty" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">
                  Faculty Portal
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex rounded-full bg-white text-sm">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-500" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/faculty/profile"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/faculty/settings"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
} 