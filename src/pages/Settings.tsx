import React, { useState } from 'react'
import {
  FiMenu,
  FiX,
  FiDroplet,
  FiCpu,
  FiZap,
  FiActivity,
  FiMonitor,
  FiFolder,
  FiBell
} from 'react-icons/fi'
import { useTheme } from '../components/ThemeProvider'

type SectionType = {
  id: string
  title: string
  icon: React.ReactNode
}

export default function Settings () {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme, themeMounted } = useTheme()

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  const [parallelTasks, setParallelTasks] = useState(() => {
    return localStorage.getItem('parallelTasks') || '3'
  })
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true'
  })

  const handleParallelTasksChange = (val: string) => {
    setParallelTasks(val)
    localStorage.setItem('parallelTasks', val)
  }

  const handleSoundChange = (val: boolean) => {
    setSoundEnabled(val)
    localStorage.setItem('soundEnabled', String(val))
  }

  const sections: SectionType[] = [
    { id: 'appearance', title: 'Appearance', icon: <FiDroplet className="w-5 h-5" /> },
    { id: 'processing', title: 'Processing', icon: <FiCpu className="w-5 h-5" /> },
    { id: 'automation', title: 'Automation', icon: <FiZap className="w-5 h-5" /> },
    { id: 'system', title: 'System', icon: <FiMonitor className="w-5 h-5" /> },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto relative lg:overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[64px] h-full lg:h-[calc(100vh-64px)] w-72 bg-white dark:bg-zinc-950/50 border-r border-zinc-200 dark:border-zinc-800 z-50 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <span className="text-xl font-bold">Settings</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex items-center gap-3 w-full p-3 text-left rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all font-medium"
              >
                <span className="text-blue-600 dark:text-blue-500">{section.icon}</span>
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-12 overflow-y-auto lg:h-[calc(100vh-64px)]">
        <div className="lg:hidden mb-8 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="max-w-3xl space-y-16 pb-20 mx-auto">
          <div className="mb-10 text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Settings</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Manage your MediaGo static site configurations.
            </p>
          </div>

          <section id="appearance" className="scroll-mt-32 space-y-6 text-left">
            <h2 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FiDroplet className="w-6 h-6 text-blue-500" /> Appearance
            </h2>
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Dark Mode</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Switch between light and dark color themes.</p>
                </div>
                <Switch checked={themeMounted ? theme === 'dark' : true} onChange={toggleDarkMode} />
              </div>
            </div>
          </section>

          <section id="processing" className="scroll-mt-32 space-y-6 text-left">
            <h2 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FiCpu className="w-6 h-6 text-purple-500" /> Processing
            </h2>
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiFolder className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  <label className="font-semibold text-zinc-900 dark:text-zinc-100">Default Output Folder</label>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Where processed files are saved.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    disabled
                    className="flex-1 w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 dark:text-zinc-500 outline-none font-mono text-sm"
                    value="Downloads folder (Browser default)"
                  />
                </div>
                <p className="text-xs text-amber-500 mt-2">Note: Local folders are not editable in client-only mode.</p>
              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  <label className="font-semibold text-zinc-900 dark:text-zinc-100">Max Parallel Tasks</label>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Limit the number of concurrent files being processed.</p>
                <select
                  value={parallelTasks}
                  onChange={(e) => handleParallelTasksChange(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none font-medium cursor-pointer"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'task' : 'tasks'}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section id="automation" className="scroll-mt-32 space-y-6 text-left">
            <h2 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FiZap className="w-6 h-6 text-amber-500" /> Automation
            </h2>
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="p-6 flex items-center justify-between">
                <div className="pr-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg flex items-center gap-2">
                    <FiBell className="w-4 h-4 text-zinc-500" /> Sound Notifications
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Play a chime when a file conversion is successfully finished.</p>
                </div>
                <Switch checked={soundEnabled} onChange={handleSoundChange} />
              </div>
            </div>
          </section>

          <section id="system" className="scroll-mt-32 space-y-6 text-left">
            <h2 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FiMonitor className="w-6 h-6 text-emerald-500" /> System
            </h2>
            <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">FFmpeg Engine</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4">Core processing library version.</p>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300">v0.12.10 (WASM)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Switch ({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${checked ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  )
}
