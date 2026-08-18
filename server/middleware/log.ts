
export default defineEventHandler((event) => {
  // console.log('新请求: ' + getRequestURL(event))
  console.log('IP: ' + getRequestIP(event))
  console.log('请求头: ' + getRequestHeaders(event))
  console.log('请求方法: ' + getMethod(event))

  // console.log('请求body: ' + readBody(event))
})
