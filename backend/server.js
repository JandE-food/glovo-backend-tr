require('dotenv').config();

const cors = require('cors');
const express = require('express');
const { createServer } = require('node:http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const addressesRouter = require('./routes/addresses.js');
const authRouter = require('./routes/auth.js');
const ordersRouter = require('./routes/orders.js');
const paymentsRouter = require('./routes/payments.js');
const restaurantsRouter = require('./routes/restaurants.js');
const { registerSocketHandlers } = require('./socket/handlers.js');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const port = Number(process.env.PORT ?? 3000);
const mongodbUri =
process.env.MONGODB_URI ?? 'mongodb://135.125.184.123/glovo_backend_tr';
mongoose.set('strictQuery', false);

app.use(cors());
app.use(express.json());
app.set('io', io);

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    mongodbConnected: mongoose.connection.readyState === 1
  });
});

app.use('/auth', authRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/orders', ordersRouter);
app.use('/addresses', addressesRouter);
app.use('/payments', paymentsRouter);

app.use((error, _request, response, _next) => {
  const message =
    error instanceof Error ? error.message : 'Unknown server error';

  response.status(500).json({
    message
  });
});

registerSocketHandlers(io);

const connectDatabase = async () => {
  try {
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'MongoDB connection failed';

    console.warn(`MongoDB connection skipped: ${message}`);
  }
};

async function start() {
  httpServer.listen(port, () => {
    console.log(`Cabuk backend is running on port ${port}`);
  });

  void connectDatabase();
}

start().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
