'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import NotificationsSummary from '@/components/admin/NotificationsSummary'

interface AdminHeaderProps {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLButtonElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node) &&
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="backdrop-blur bg-white/80 shadow-lg border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-8 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-7 w-7"
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
            <div className="ml-6 lg:ml-0">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-blue-700">CampusMind</span>
                <span className="text-lg font-bold text-gray-700 hidden sm:inline">Admin Portal</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative">
            <button
                ref={notifRef}
              type="button"
                className="relative rounded-full bg-white p-2 text-gray-400 hover:text-blue-600 transition"
                onClick={() => setShowNotifications((v) => !v)}
            >
              <span className="sr-only">View notifications</span>
              <svg
                  className="h-7 w-7"
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
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow">3</span>
            </button>
              {showNotifications && (
                <div ref={notifDropdownRef} className="absolute right-0 mt-2 w-96 z-50">
                  <NotificationsSummary />
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex rounded-full border-2 border-blue-200 bg-white shadow hover:shadow-lg transition-transform hover:scale-105 text-sm focus:outline-none">
                <span className="sr-only">Open user menu</span>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
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
                <Menu.Items className="absolute right-0 z-20 mt-3 w-56 origin-top-right rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/admin/profile"
                        className={`$${active ? 'bg-blue-50' : ''} block px-5 py-2 text-base text-gray-700 rounded-lg`}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/admin/settings"
                        className={`$${active ? 'bg-blue-50' : ''} block px-5 py-2 text-base text-gray-700 rounded-lg`}
                      >
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`$${active ? 'bg-blue-50' : ''} block w-full px-5 py-2 text-left text-base text-gray-700 rounded-lg`}
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