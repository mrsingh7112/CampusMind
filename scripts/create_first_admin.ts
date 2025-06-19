const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'baljinder.s7112@gmail.com'
  const username = 'baljinder'
  const name = 'Baljinder Singh'
  const password = 'Simbal7112'
  const phone = '6280708344'

  // Check if admin already exists
  const existing = await prisma.admin.findFirst({ where: { email } })
  if (existing) {
    console.log('Admin with this email already exists.')
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.admin.create({
    data: {
      name,
      email,
      username,
      password: hashed,
      phone,
      isSuperAdmin: true
    }
  })
  console.log('First admin created successfully!')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect()) 