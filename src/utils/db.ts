/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => new PrismaClient()

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
