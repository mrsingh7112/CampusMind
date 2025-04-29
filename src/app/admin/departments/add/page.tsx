"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, BookOpen, Building2, Layers } from "lucide-react"

const DEPARTMENTS = [
  { label: "School of Computational Science", value: "School of Computational Science" },
  { label: "School of Management", value: "School of Management" },
  { label: "School of Engineering", value: "School of Engineering" },
  { label: "School of Arts & Humanities", value: "School of Arts & Humanities" },
  { label: "School of Life Sciences", value: "School of Life Sciences" },
  { label: "School of Commerce", value: "School of Commerce" },
  { label: "School of Law", value: "School of Law" },
  { label: "School of Design", value: "School of Design" },
]

const COURSES = [
  { label: "BCA", value: "BCA" },
  { label: "BSc", value: "BSc" },
  { label: "MCA", value: "MCA" },
  { label: "MSc", value: "MSc" },
  { label: "BBA", value: "BBA" },
  { label: "MBA", value: "MBA" },
  { label: "BTech", value: "BTech" },
  { label: "MTech", value: "MTech" },
  { label: "BA", value: "BA" },
  { label: "MA", value: "MA" },
  { label: "BCom", value: "BCom" },
  { label: "MCom", value: "MCom" },
  { label: "LLB", value: "LLB" },
  { label: "LLM", value: "LLM" },
  { label: "BDes", value: "BDes" },
  { label: "MDes", value: "MDes" },
]

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function AddDepartmentPage() {
  const [department, setDepartment] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courseSubjects, setCourseSubjects] = useState<{
    [course: string]: { [semester: number]: string[] }
  }>({})
  const [currentCourse, setCurrentCourse] = useState("")
  const [currentSemester, setCurrentSemester] = useState<number | null>(null)
  const [subjectInput, setSubjectInput] = useState("")

  // Add course to selected list
  const handleCourseSelect = (course: string) => {
    if (!selectedCourses.includes(course)) {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  // Remove course
  const handleRemoveCourse = (course: string) => {
    setSelectedCourses(selectedCourses.filter(c => c !== course))
    const newSubjects = { ...courseSubjects }
    delete newSubjects[course]
    setCourseSubjects(newSubjects)
  }

  // Add subject to a course/semester
  const handleAddSubject = () => {
    if (!currentCourse || !currentSemester || !subjectInput) return
    setCourseSubjects(prev => ({
      ...prev,
      [currentCourse]: {
        ...(prev[currentCourse] || {}),
        [currentSemester]: [
          ...((prev[currentCourse]?.[currentSemester] || [])),
          subjectInput,
        ],
      },
    }))
    setSubjectInput("")
  }

  // Remove subject
  const handleRemoveSubject = (course: string, semester: number, idx: number) => {
    setCourseSubjects(prev => {
      const updated = { ...prev }
      updated[course][semester] = updated[course][semester].filter((_, i) => i !== idx)
      if (updated[course][semester].length === 0) delete updated[course][semester]
      if (Object.keys(updated[course]).length === 0) delete updated[course]
      return updated
    })
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        type: "department",
        name: department,
        courses: selectedCourses.map(course => ({
          name: course,
          subjects: Object.entries(courseSubjects[course] || {}).map(([semester, subjects]) => ({
            semester: Number(semester),
            subjects,
          })),
        })),
      }
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add department')
      }
      
      const result = await response.json()
      alert("Department and courses added successfully!")
      
      // Reset form
      setDepartment("")
      setSelectedCourses([])
      setCourseSubjects({})
      setCurrentCourse("")
      setCurrentSemester(null)
      setSubjectInput("")
    } catch (error) {
      console.error('Error adding department:', error)
      alert(`Failed to add department: ${error.message}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg mt-10 border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-blue-700">
        <Building2 className="w-8 h-8 text-blue-500" /> Add Department
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-800">Department</label>
          <div className="flex items-center gap-2">
            <select
              className="w-full border-2 border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 bg-white"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dep => (
                <option key={dep.value} value={dep.value}>{dep.label}</option>
              ))}
            </select>
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-800">Courses</label>
          <div className="flex flex-wrap gap-2">
            {COURSES.map(course => (
              <button
                type="button"
                key={course.value}
                className={`px-4 py-2 rounded-full border-2 flex items-center gap-1 font-medium shadow-sm transition-all duration-150
                  ${selectedCourses.includes(course.value)
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white border-blue-400 scale-105'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}
                `}
                onClick={() => handleCourseSelect(course.value)}
                disabled={selectedCourses.includes(course.value)}
              >
                <BookOpen className="w-4 h-4" /> {course.label}
              </button>
            ))}
          </div>
          {/* Show selected courses as badges with remove option */}
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCourses.map(course => (
              <span key={course} className="inline-flex items-center bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold shadow">
                {course}
                <button type="button" className="ml-2 text-blue-700 hover:text-red-500" onClick={() => handleRemoveCourse(course)} title="Remove">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        {/* For each selected course, allow adding subjects per semester */}
        {selectedCourses.map(course => (
          <div key={course} className="mb-8 border-2 border-purple-200 rounded-lg p-5 bg-white/80 shadow">
            <h4 className="font-semibold mb-3 text-purple-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> {course} - Add Subjects
            </h4>
            <div className="flex gap-2 mb-3">
              <select
                className="border-2 border-blue-200 rounded-lg p-1 focus:ring-2 focus:ring-blue-400 bg-white"
                value={currentCourse === course ? currentSemester || '' : ''}
                onChange={e => {
                  setCurrentCourse(course)
                  setCurrentSemester(Number(e.target.value))
                }}
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <input
                type="text"
                className="border-2 border-blue-200 rounded-lg p-1 focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Subject name"
                value={currentCourse === course ? subjectInput : ''}
                onChange={e => {
                  setCurrentCourse(course)
                  setSubjectInput(e.target.value)
                }}
              />
              <Button type="button" onClick={handleAddSubject} className="bg-gradient-to-r from-blue-400 to-purple-400 text-white font-semibold flex items-center gap-1">
                <PlusCircle className="w-4 h-4" /> Add Subject
              </Button>
            </div>
            {/* List subjects for this course/semester */}
            {Object.entries(courseSubjects[course] || {}).map(([sem, subjects]) => (
              <div key={sem} className="mb-2">
                <span className="font-medium text-blue-700">Semester {sem}:</span>
                <ul className="list-disc ml-6 mt-1">
                  {(subjects as string[]).map((subj, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-pink-200 to-purple-200 px-2 py-0.5 rounded text-purple-900 font-medium text-sm shadow-sm">
                        {subj}
                      </span>
                      <button type="button" className="text-red-500 hover:text-red-700 text-lg font-bold" onClick={() => handleRemoveSubject(course, Number(sem), idx)} title="Remove Subject">&times;</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        <Button type="submit" className="mt-6 w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-lg">
          Save Department
        </Button>
      </form>
    </div>
  )
} 