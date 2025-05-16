const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Cấu hình Redis để kết nối với container Redis
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Cấu hình CORS và Socket.IO
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Xử lý kết nối Socket.IO
io.on('connection', async (socket) => {
  console.log('New client connected with ID:', socket.id);
  
  try {
    // Gửi lịch sử tin nhắn cho client mới kết nối
    const storedMessages = await redis.lrange('messages', 0, -1);
    console.log('Retrieved messages from Redis:', storedMessages.length);
    
    const parsedMessages = storedMessages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (e) {
        console.error('Error parsing message:', e);
        return null;
      }
    }).filter(Boolean).reverse(); // Đảo lại cho đúng thứ tự
    
    console.log('Sending chat history to client');
    socket.emit('chat history', parsedMessages);
  } catch (err) {
    console.error('Error retrieving chat history:', err);
  }
  
  // Lắng nghe tin nhắn mới
  socket.on('chat message', async (msg) => {
    console.log('Received message:', msg);
    
    try {
      // Lưu tin nhắn vào Redis
      await redis.lpush('messages', JSON.stringify(msg));
      
      // Phát sóng tin nhắn tới tất cả client
      io.emit('chat message', msg);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  // Lắng nghe sự kiện disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Khởi tạo dữ liệu mẫu khi server starts
(async () => {
  try {
    // Kiểm tra kết nối Redis
    await redis.ping();
    console.log('Successfully connected to Redis');
    
    // Thêm tin nhắn chào mừng
    const welcomeMessage = {
      text: 'Chào mừng bạn đến với ứng dụng chat!', 
      timestamp: new Date().toISOString(),
      sender: 'system'
    };
    
    // Đếm số lượng tin nhắn hiện có
    const existingMessages = await redis.llen('messages');
    
    // Chỉ thêm tin nhắn chào mừng nếu không có tin nhắn nào
    if (existingMessages === 0) {
      console.log('Adding welcome message');
      await redis.lpush('messages', JSON.stringify(welcomeMessage));
    } else {
      console.log(`Found ${existingMessages} existing messages in Redis`);
    }
  } catch (err) {
    console.error('Redis initialization error:', err);
  }
})();

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));