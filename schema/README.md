# MongoDB Docker Compose Setup

This Docker Compose configuration provides a MongoDB database with MongoDB Express web interface and persistent data storage.

## Services

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Authentication**: Disabled (no username/password required)
- **Database**: myapp

### MongoDB Express
- **Image**: mongo-express:1.0.0
- **Port**: 8081
- **Authentication**: Disabled (no login required)

## Quick Start

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Access MongoDB Express:**
   Open your browser and go to: http://localhost:8081
   (No login required)

3. **Connect to MongoDB directly:**
   ```
   mongodb://localhost:27017/myapp
   ```

## Commands

### Start services in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (⚠️ This will delete all data)
```bash
docker-compose down -v
```

### Restart services
```bash
docker-compose restart
```

## Persistent Storage

Data is persisted using Docker volumes:
- `mongodb_data`: Stores the actual database files
- `mongodb_config`: Stores MongoDB configuration files

Even if you stop and remove containers, your data will remain intact unless you explicitly remove the volumes.

## Security Notes

**⚠️ Important for Production:**
- This setup has NO authentication for development ease
- For production, enable MongoDB authentication
- Restrict network access as needed
- Enable SSL/TLS for secure connections
- Consider using MongoDB Atlas for production deployments

## Environment Variables

You can modify the configuration by editing the `.env` file:

- `MONGO_INITDB_DATABASE`: Initial database name
- `MONGODB_URI`: Complete MongoDB connection string (no authentication)
- `MONGO_HOST`: MongoDB host (default: localhost)
- `MONGO_PORT`: MongoDB port (default: 27017)
- `MONGO_EXPRESS_PORT`: MongoDB Express port (default: 8081)

## Node.js Connection Scripts

### Prerequisites
Make sure you have Node.js 24+ installed and run:
```bash
npm install
```

### Running the Scripts

1. **Full connection test with operations:**
   ```bash
   npm start
   # or
   node connect-mongodb.js
   ```

2. **Simple connection example:**
   ```bash
   node simple-example.js
   ```

3. **Development mode with auto-restart:**
   ```bash
   npm run dev
   ```

### Script Features

**connect-mongodb.js:**
- Loads configuration from `.env` file
- Establishes connection to MongoDB container
- Tests basic CRUD operations
- Handles connection cleanup
- Provides detailed logging
- Can be imported as a module

**simple-example.js:**
- Minimal connection example
- Shows basic insert and find operations
- Good starting point for your own scripts

### Before Running Scripts
1. Start the Docker containers: `docker-compose up -d`
2. Wait a few seconds for MongoDB to be ready
3. Run your Node.js script