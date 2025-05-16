const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const redis = new Redis();

app.get('/health', (req, res) => res.send('OK'));
app.use(cors());

io.on('connection', async (socket) => {
  console.log('New client connected with ID:', socket.id);
  
  // Gửi tất cả tin nhắn đã lưu từ Redis cho client mới kết nối
  try {
    const storedMessages = await redis.lrange('messages', 0, -1);
    console.log('Retrieved messages from Redis:', storedMessages.length);
    const parsedMessages = storedMessages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (e) {
        console.error('Error parsing message:', msg, e);
        return null;
      }
    }).filter(Boolean).reverse(); // đảo lại cho đúng thứ tự
    
    console.log('Sending chat history to client:', parsedMessages);
    socket.emit('chat history', parsedMessages);
  } catch (err) {
    console.error('Error retrieving chat history:', err);
  }

  // Lắng nghe và xử lý tin nhắn mới
  socket.on('chat message', async (msg) => {
    console.log('Received message:', msg);
    try {
      const result = await redis.lpush('messages', JSON.stringify(msg));
      console.log('LPUSH result:', result); // result là số lượng phần tử trong list sau khi push
    } catch (error) {
      console.error('Redis LPUSH error:', error);
    }
    io.emit('chat message', msg);
  });
});

(async () => {
  try {
    await redis.del('messages'); // Xóa hết tin nhắn cũ
    const testMessage = {
      text: 'Chào mừng bạn đến với ứng dụng chat!', 
      timestamp: new Date().toISOString(),
      sender: 'system'
    };
    console.log('Adding test message:', testMessage);
    await redis.lpush('messages', JSON.stringify(testMessage));
    const messages = await redis.lrange('messages', 0, -1);
    console.log('Test messages from Redis:', messages);
    
    // Kiểm tra xem có thể parse được không
    try {
      const parsed = JSON.parse(messages[0]);
      console.log('Parsed test message:', parsed);
    } catch (err) {
      console.error('Error parsing test message:', err);
    }
  } catch (err) {
    console.error('Error in initialization:', err);
  }
})();

server.listen(3000, () => console.log('Backend running on port 3000'));