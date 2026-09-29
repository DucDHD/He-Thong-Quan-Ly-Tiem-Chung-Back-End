import { User } from '@/modules/users/entities/user.entity'

export const pickUser = (user: User) => {
  const {
    user_id,
    fullName,
    email,
    address,
    phone,
    dateOfBirth,
    gender,
    cccd,
    role,
    isActive,
    createdAt,
    updatedAt
  } = user

  return {
    user_id,
    fullName,
    email,
    address,
    phone,
    dateOfBirth,
    gender,
    cccd,

    role_id: role?.role_id,
    role_code: role?.role_code,
    role_name: role?.role_name,

    isActive,
    createdAt,
    updatedAt
  }
}