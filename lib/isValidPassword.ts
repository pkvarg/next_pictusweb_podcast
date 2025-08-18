import bcrypt from 'bcrypt'

export async function isValidPassword(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function hashPassword(password: string) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}
