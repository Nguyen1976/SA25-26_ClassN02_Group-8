const axios = require('axios')
const os = require('os')
const { monitorEventLoopDelay } = require('perf_hooks')

// ==========================
// CONFIG
// ==========================
const BASE_URL = 'http://localhost:3000'
const PASSWORD = 'heheheee'
const TOTAL_USERS = 10000
const CONCURRENCY = 100
const INVITER_ID = '693befebbeed61ee46291bf3'

// ==========================
// STATS
// ==========================
let loginSuccess = 0
let loginFail = 0
let acceptSuccess = 0
let acceptFail = 0

// ==========================
// EVENT LOOP MONITOR
// ==========================
const h = monitorEventLoopDelay({ resolution: 20 })
h.enable()

setInterval(() => {
  const mem = process.memoryUsage()
  const cpu = process.cpuUsage()

  console.clear()

  console.log('================ SYSTEM =================')
  console.log('CPU Cores:', os.cpus().length)
  console.log('Load Avg:', os.loadavg())

  console.log('\n================ PROCESS =================')
  console.log('RSS MB:', (mem.rss / 1024 / 1024).toFixed(2))
  console.log('Heap Used MB:', (mem.heapUsed / 1024 / 1024).toFixed(2))
  console.log('CPU User (ms):', (cpu.user / 1000).toFixed(0))
  console.log('CPU System (ms):', (cpu.system / 1000).toFixed(0))
  console.log('Event Loop Delay (ms):', (h.mean / 1e6).toFixed(2))

  console.log('\n================ LOAD =================')
  console.log('Login Success:', loginSuccess)
  console.log('Login Fail:', loginFail)
  console.log('Accept Success:', acceptSuccess)
  console.log('Accept Fail:', acceptFail)
  console.log('========================================')
}, 5000)

// ==========================
// LOGIN
// ==========================
async function login(email) {
  try {
    const res = await axios.post(`${BASE_URL}/user/login`, {
      email,
      password: PASSWORD,
    })

    loginSuccess++
    return res.data.data.token
  } catch (err) {
    loginFail++
    return null
  }
}

// ==========================
// ACCEPT FRIEND
// ==========================
async function acceptFriend(token, index) {
  try {
    await axios.post(
      `${BASE_URL}/user/update-status-make-friend`,
      {
        inviterId: INVITER_ID,
        status: 'ACCEPTED',
        inviteeName: `user${index}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    acceptSuccess++
  } catch (err) {
    acceptFail++
  }
}

// ==========================
// MAIN
// ==========================
async function run() {
  console.log(`Starting ACCEPT load test`)
  console.log(`Users: ${TOTAL_USERS}`)
  console.log(`Concurrency: ${CONCURRENCY}`)

  const startTime = Date.now()

  for (let i = 1; i <= TOTAL_USERS; i += CONCURRENCY) {
    const batch = []

    for (
      let j = i;
      j < i + CONCURRENCY && j <= TOTAL_USERS;
      j++
    ) {
      batch.push(
        (async () => {
          const email = `user${j}@test.com`
          const token = await login(email)

          if (token) {
            await acceptFriend(token, j)
          }
        })(),
      )
    }

    await Promise.all(batch)
  }

  const duration = (Date.now() - startTime) / 1000

  console.log('\n========== DONE ==========')
  console.log('Total time:', duration.toFixed(2), 'seconds')
  console.log(
    'Throughput:',
    (TOTAL_USERS / duration).toFixed(2),
    'req/sec',
  )
}

run()
