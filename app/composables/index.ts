export const useUser = () => {
  // 这里可以使用 Nuxt 提供的其他工具，如 useState, useFetch
  const user = useState('user', () => null)

  const fetchUser = async (id: string) => {
    user.value = {
      userId: id,
      name: 'John Doe',
    }
  }

  return { user, fetchUser }
}
