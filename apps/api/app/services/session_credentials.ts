import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

/** Resolves an active account when its stored password matches the credentials. */
export async function verifySessionCredentials(email: string, password: string) {
  const user = await User.findBy('email', email)
  if (!user) {
    // Perform equivalent hashing work for unknown accounts.
    await hash.make(password)
    return null
  }

  const matches = await hash.verify(user.password, password)
  return matches && user.isActive ? user : null
}
