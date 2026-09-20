import type { UserInfo } from '@vben/types'

import { requestClient } from '../../runtime/request.ts'

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient().get<UserInfo>('/user/info')
}
