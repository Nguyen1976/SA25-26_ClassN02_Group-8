import http from 'k6/http'
import ws from 'k6/ws'
import { Counter, Rate } from 'k6/metrics'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'


// ─── Config ──────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000'
// Socket.IO: namespace "/realtime" là protocol-level, KHÔNG phải URL path
// Frontend dùng: io('http://localhost:3001/realtime') → client tự tách:
//   server = localhost:3001, path = /socket.io/ (default), namespace = /realtime
const WS_URL =
  'ws://localhost:3001/socket.io/?EIO=4&transport=websocket'
const SIO_NAMESPACE = '/realtime'

const PASSWORD = 'heheheee'
const CONVERSATION_ID = '69861483597e126521362d29'

const SOCKET_DURATION = 60000 // giữ socket 60s
const WARMUP_TIME = 5000 // chờ 5s cho user ổn định
const SEND_INTERVAL = 2000 // gửi mỗi 2s

// ─── Custom Metrics ──────────────────────────────────────
const sentMessages = new Counter('sent_messages')
const receivedMessages = new Counter('received_messages')
const sendSuccessRate = new Rate('send_success_rate')

// ─── Options ─────────────────────────────────────────────
export const options = {
  scenarios: {
    chat_load: {
      executor: 'per-vu-iterations',
      vus: 200,
      iterations: 1,
      maxDuration: '90s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    send_success_rate: ['rate>0.95'],
  },
}

// ─── Main ────────────────────────────────────────────────
export default function () {
  const vuId = __VU
  const email = `user${vuId}@test.com`

  // ── Step 1: LOGIN ─────────────────────────────────────
  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  )

  if (loginRes.status !== 200 && loginRes.status !== 201) {
    console.error(`[VU ${vuId}] Login failed: ${loginRes.status}`)
    return
  }

  let body
  try {
    body = JSON.parse(loginRes.body)
  } catch (e) {
    console.error(`[VU ${vuId}] Cannot parse login response`)
    return
  }

  const token = body.data.token
  if (!token) {
    console.error(`[VU ${vuId}] No token`)
    return
  }

  let receiveCount = 0
  let authenticated = false

  // ── Step 2-4: WebSocket connect + send + listen ───────
  ws.connect(WS_URL, {}, function (socket) {
    // ── On message: xử lý toàn bộ EIO4 / Socket.IO protocol ──
    socket.on('message', function (data) {
      // Engine.IO open packet "0{...}" → gửi Socket.IO CONNECT to /realtime namespace
      // Format: 40/realtime,{"token":"..."}
      if (data.startsWith('0{')) {
        const connectPacket =
          '40' + SIO_NAMESPACE + ',' + JSON.stringify({ token })
        socket.send(connectPacket)
        return
      }

      // Engine.IO ping → pong (giữ connection sống)
      if (data === '2') {
        socket.send('3')
        return
      }

      // Socket.IO connect ACK cho namespace /realtime
      // Server trả: "40/realtime,{"sid":"..."}"
      if (data.startsWith('40' + SIO_NAMESPACE + ',')) {
        authenticated = true
        console.log(`[VU ${vuId}] Authenticated`)
        return
      }

      // Socket.IO event cho namespace /realtime
      // Server gửi: "42/realtime,["chat.new_message", {...}]"
      const eventPrefix = '42' + SIO_NAMESPACE + ','
      if (data.startsWith(eventPrefix)) {
        try {
          const payload = JSON.parse(data.substring(eventPrefix.length))
          if (payload[0] === 'chat.new_message') {
            receiveCount++
            receivedMessages.add(1)
          }
        } catch (_) {}
        return
      }
    })

    // ── WARMUP: đợi 5s cho toàn bộ user connect ổn định ──
    socket.setTimeout(function () {
      // Bắt đầu gửi message mỗi 2s qua HTTP API
      socket.setInterval(function () {
        if (!authenticated) return

        const res = http.post(
          `${BASE_URL}/chat/send_message`,
          JSON.stringify({
            conversationId: CONVERSATION_ID,
            message: `hello from user${vuId}`,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const success = res.status === 200 || res.status === 201
        sendSuccessRate.add(success)

        if (success) {
          sentMessages.add(1)
        } else if (vuId <= 3) {
          // Log lỗi cho 3 VU đầu tiên để debug
          console.error(
            `[VU ${vuId}] send_message failed: status=${res.status} body=${res.body}`,
          )
        }
      }, SEND_INTERVAL)
    }, WARMUP_TIME)

    // ── Đóng socket sau đúng 60s ──
    socket.setTimeout(function () {
      console.log(`[VU ${vuId}] Done. Received: ${receiveCount}`)
      socket.close()
    }, SOCKET_DURATION)
  })
}

export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}
