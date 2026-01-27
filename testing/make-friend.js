const axios = require('axios')
const os = require('os')
const { monitorEventLoopDelay } = require('perf_hooks')

// ==========================
// CONFIG
// ==========================
const BASE_URL = 'http://localhost:3000'
const LOGIN_EMAIL = 'nguyen2202794@gmail.com'
const PASSWORD = 'heheheee'

const TOTAL_USERS = 10000
const CONCURRENCY = 100 // 🔥 100 request song song

// ==========================
// STATS
// ==========================
let friendSuccess = 0
let friendFail = 0

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
  console.log('Make Friend Success:', friendSuccess)
  console.log('Make Friend Fail:', friendFail)
  console.log('========================================')
}, 5000)

// ==========================
// LOGIN
// ==========================
async function login() {
  try {
    const res = await axios.post(`${BASE_URL}/user/login`, {
      email: LOGIN_EMAIL,
      password: PASSWORD,
    })

    console.log('Login success')
    return res.data.data.token
  } catch (err) {
    console.error('Login failed')
    process.exit(1)
  }
}

// ==========================
// MAKE FRIEND
// ==========================
async function makeFriend(token, email) {
  try {
    await axios.post(
      `${BASE_URL}/user/make-friend`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    friendSuccess++
  } catch (err) {
    friendFail++
  }
}

// ==========================
// MAIN
// ==========================
async function run() {
  const token = await login()

  console.log(`Starting load test: ${TOTAL_USERS} users`)
  console.log(`Concurrency: ${CONCURRENCY}`)

  const startTime = Date.now()

  for (let i = 1; i <= TOTAL_USERS; i += CONCURRENCY) {
    const batch = []

    for (
      let j = i;
      j < i + CONCURRENCY && j <= TOTAL_USERS;
      j++
    ) {
      const email = `user${j}@test.com`
      batch.push(makeFriend(token, email))
    }

    await Promise.all(batch)
  }

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000

  console.log('\n========== DONE ==========')
  console.log('Total time:', duration.toFixed(2), 'seconds')
  console.log(
    'Throughput:',
    (TOTAL_USERS / duration).toFixed(2),
    'req/sec',
  )
}

run()
