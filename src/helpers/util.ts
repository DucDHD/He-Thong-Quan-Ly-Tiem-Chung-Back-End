import bcrypt from 'bcrypt'

const saltRounds = 8

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, saltRounds)
}

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword)
}
