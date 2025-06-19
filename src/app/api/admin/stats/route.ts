import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const totalCourses = await prisma.course.count();
    const totalClasses = await prisma.timetableSlot.count(); // Corrected from prisma.class.count()

    return NextResponse.json({
      totalStudents,
      totalFaculty,
      totalCourses,
      totalClasses,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return new NextResponse("Failed to fetch dashboard statistics", { status: 500 });
  }
} 