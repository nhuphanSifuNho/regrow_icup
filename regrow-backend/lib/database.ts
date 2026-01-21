import mongoose from 'mongoose';

/**
 * MongoDB Connection Configuration
 *
 * Manages database connection with automatic reconnection and error handling.
 * Best practices:
 * - Connection pooling for performance
 * - Automatic retry logic
 * - Graceful shutdown handling
 * - Debug mode for development
 */

interface ConnectionOptions {
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  family?: number;
}

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Connect to MongoDB Atlas
   */
  async connect(mongoUri?: string): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Using existing MongoDB connection');
      return;
    }

    const uri = mongoUri || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options: ConnectionOptions = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for initial server selection
      socketTimeoutMS: 45000, // How long to wait before timing out a socket operation
      family: 4 // Use IPv4, skip trying IPv6
    };

    try {
      // Enable debug mode in development
      if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', true);
      }

      await mongoose.connect(uri, options);
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${mongoose.connection.db?.databaseName || 'N/A'}`);

      // Setup connection event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('👋 MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database instance
   */
  getDatabase() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return mongoose.connection.db;
  }

  /**
   * Setup event listeners for connection monitoring
   */
  private setupEventListeners(): void {
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Reconnection events
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('❌ Mongoose reconnection failed');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', this.gracefulShutdown.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.gracefulShutdown.bind(this, 'SIGTERM'));
  }

  /**
   * Graceful shutdown handler
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n📴 ${signal} received. Closing MongoDB connection...`);
    try {
      await this.disconnect();
      console.log('✅ MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize database indexes
   *
   * This should be called after all models are loaded to ensure
   * all indexes are created in MongoDB
   */
  async initializeIndexes(): Promise<void> {
    try {
      console.log('🔧 Initializing database indexes...');

      // Get all model names
      const modelNames = mongoose.modelNames();

      for (const modelName of modelNames) {
        const model = mongoose.model(modelName);
        await model.syncIndexes();
        console.log(`  ✓ Indexes synced for ${modelName}`);
      }

      console.log('✅ All indexes initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing indexes:', error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{
    status: string;
    database: string | null;
    readyState: number;
  }> {
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      database: mongoose.connection.db?.databaseName || null,
      readyState: mongoose.connection.readyState
    };
  }
}

// Export singleton instance
export const database = Database.getInstance();

// Export mongoose for direct access if needed
export { mongoose };