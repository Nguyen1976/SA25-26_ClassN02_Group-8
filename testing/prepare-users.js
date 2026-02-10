import http from 'k6/http'
import { check } from 'k6'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

const BASE_URL = 'http://localhost:3000'

const MAIN_EMAIL = '23010310@st.phenikaa-uni.edu.vn'
const MAIN_PASSWORD = 'heheheee'

const USERS_PER_VU = 20 // 100 VU × 20 = 2000 user

export const options = {
  scenarios: {
    create_users: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: USERS_PER_VU,
      maxDuration: '10m',
    },
  },
}

// 🔹 Setup: login main account
export function setup() {
  console.log('Login main account...')

  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({
      email: MAIN_EMAIL,
      password: MAIN_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  const loginData = JSON.parse(loginRes.body)

  return {
    mainToken: loginData.data.token,
    mainId: loginData.data.id,
  }
}

// 🔹 Mỗi iteration tạo 1 user
export default function (data) {
  const globalIndex = (__VU - 1) * USERS_PER_VU + __ITER + 1

  const email = `user${globalIndex}@test.com`
  const username = `user${globalIndex}`
  const password = 'heheheee'

  // 1️⃣ Register
  http.post(
    `${BASE_URL}/user/register`,
    JSON.stringify({ email, username, password }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  // 2️⃣ Main gửi lời mời kết bạn
  http.post(`${BASE_URL}/user/make-friend`, JSON.stringify({ email }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.mainToken}`,
    },
  })

  // 3️⃣ Login user test
  const userLogin = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  const userData = JSON.parse(userLogin.body)
  const userToken = userData.data.token
  const userId = userData.data.id

  // 4️⃣ Accept lời mời
  http.post(
    `${BASE_URL}/user/update-status-make-friend`,
    JSON.stringify({
      inviterId: data.mainId,
      status: 'ACCEPTED',
      inviteeName: username,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
  )

  // 🔹 Lưu userId vào global object (hack nhỏ)
  if (!globalThis.memberIds) {
    globalThis.memberIds = []
  }
  globalThis.memberIds.push(userId)

  // 🔹 Chỉ VU cuối cùng tạo group sau khi xong iteration cuối
  if (__VU === 100 && __ITER === USERS_PER_VU - 1) {
    console.log('Creating group...')

    http.post(
      `${BASE_URL}/chat/create`,
      JSON.stringify({
        groupName: 'Nguyen',
        members: globalThis.memberIds.map((id) => ({ userId: id })),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.mainToken}`,
        },
      },
    )
  }
}

// 🔹 Xuất report
export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}
