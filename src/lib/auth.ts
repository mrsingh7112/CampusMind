import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize function called with credentials:", credentials);

        // --- TEMPORARY: Allow dummy student user for testing the flow ---
        if (credentials?.email === "dummyStudentUser@example.com" && credentials?.password === "password") {
          console.log("Temporary student bypass hit!");
          return {
            id: "dummyStudentId", // Replace with a real ID in a production scenario
            email: "dummyStudentUser@example.com",
            name: "Dummy Student",
            role: "STUDENT",
          };
        }
        // --- END TEMPORARY ---

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password.");
          throw new Error('Please enter an email/ID and password');
        }

        // 1. Try to find admin (by email only)
        let user = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });
        if (user) {
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            console.log("Admin: Incorrect password.");
            throw new Error('Incorrect password');
          }
          console.log("Admin user found.");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'ADMIN',
            isSuperAdmin: user.isSuperAdmin,
            profilePicture: user.profilePicture,
          };
        }

        // 2. Try to find faculty (by email or employeeId)
        user = await prisma.faculty.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { employeeId: credentials.email },
            ],
          },
        });
        if (user) {
          if (user.status !== 'ACTIVE') {
            console.log("Faculty: Account not active.");
            throw new Error('Your account is not active');
          }
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            console.log("Faculty: Incorrect password.");
            throw new Error('Incorrect password');
          }
          console.log("Faculty user found.");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'FACULTY',
            profilePicture: user.profilePicture,
          };
        }

        // 3. Try to find student (by email or rollNumber)
        user = await prisma.student.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { rollNumber: credentials.email },
            ],
          },
        });
        if (user) {
          if (user.status !== 'ACTIVE') {
            console.log("Student: Account not active.");
            throw new Error('Your account is not active');
          }
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            console.log("Student: Incorrect password.");
            throw new Error('Incorrect password');
          }
          console.log("Student user found.");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'STUDENT',
            profilePicture: user.profilePicture,
          };
        }

        console.log("No user found with provided credentials.");
        throw new Error('No user found with this email or ID');
      },
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        if (user.role === 'ADMIN') {
          token.isSuperAdmin = (user as any).isSuperAdmin;
        }
        if ((user as any).profilePicture) {
          token.profilePicture = (user as any).profilePicture;
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.role === 'ADMIN') {
          (session.user as any).isSuperAdmin = token.isSuperAdmin;
        }
        if (token.profilePicture) {
          (session.user as any).profilePicture = token.profilePicture;
        }
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} 