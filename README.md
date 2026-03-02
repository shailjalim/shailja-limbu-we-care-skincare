# We Care - MERN Stack Application

A full-stack web application built with the MERN (MongoDB, Express.js, React, Node.js) stack. This project follows the MVC architecture pattern and is designed to be beginner-friendly while following industry best practices.

## 📁 Project Structure

```
we-care/
│
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (routes)
│   │   ├── services/           # Axios API calls
│   │   │   └── api.js
│   │   ├── context/            # React Context for state management
│   │   │   └── AppContext.js
│   │   ├── App.js              # Main App component
│   │   ├── App.css             # App styles
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   └── package.json
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route handlers
│   │   └── testController.js
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Express routes
│   │   └── testRoutes.js
│   ├── middleware/             # Custom middleware
│   ├── server.js               # Express app entry point
│   ├── sample-env.txt          # Environment variables template
│   └── package.json
│
└── README.md
```

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Clone or Download the Project

```bash
cd we-care
```

### Step 2: Set Up the Backend

1. Navigate to the server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
   - Copy `sample-env.txt` and rename it to `.env`
   - Update the values as needed (default values should work for local development)

```bash
# Windows (PowerShell)
Copy-Item sample-env.txt .env

# Mac/Linux
cp sample-env.txt .env
```

4. Make sure MongoDB is running on your machine:
   - Windows: MongoDB should run as a service, or start it manually
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### Step 3: Set Up the Frontend

1. Open a new terminal and navigate to the client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

**Terminal 1 - Start the Backend:**
```bash
cd server
npm run dev
```
The backend will start on http://localhost:5000

**Terminal 2 - Start the Frontend:**
```bash
cd client
npm start
```
The frontend will start on http://localhost:3000

### Option 2: Run Backend Only
```bash
cd server
npm start        # Production mode
npm run dev      # Development mode with auto-reload (nodemon)
```

## 🔍 Testing the Setup

1. **Backend API Test:**
   - Open your browser and go to: http://localhost:5000/api/test
   - You should see: `{ "success": true, "message": "Backend is running", "timestamp": "..." }`

2. **Frontend Test:**
   - Open your browser and go to: http://localhost:3000
   - You should see the We Care homepage with a green "Backend Connected" status

3. **Health Check:**
   - Go to: http://localhost:5000/api/health
   - You'll see detailed server health information

## 📡 API Endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/`           | Welcome message                |
| GET    | `/api/test`   | Test backend connection        |
| GET    | `/api/health` | Server health check            |

## 🔧 Configuration

### Environment Variables (server/.env)

| Variable     | Description                    | Default                            |
|--------------|--------------------------------|------------------------------------|
| PORT         | Server port                    | 5000                               |
| MONGODB_URI  | MongoDB connection string      | mongodb://localhost:27017/wecare   |
| JWT_SECRET   | Secret for JWT tokens          | your_jwt_secret_key_here           |
| NODE_ENV     | Environment mode               | development                        |

## 📚 Technology Stack

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with CSS variables

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **MongoDB** - NoSQL database

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern:

- **Models** (`server/models/`): Define data structure and database schema
- **Views** (`client/src/`): React components for the user interface
- **Controllers** (`server/controllers/`): Handle business logic and API responses

## 🔐 Authentication (Ready for Implementation)

The project structure is prepared for JWT authentication:

1. **Backend:**
   - JWT_SECRET configured in environment
   - Middleware folder ready for auth middleware
   - Request interceptors set up in API service

2. **Frontend:**
   - Context for user state management
   - Token storage in localStorage
   - Authorization header attachment in API calls

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is installed and running
- Check if the MongoDB service is started
- Verify the MONGODB_URI in your .env file

### Port Already in Use
- Change the PORT in .env file
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -i :5000
  kill -9 <PID>
  ```

### CORS Error
- Ensure the backend is running on port 5000
- Check that CORS is properly configured in server.js

### npm install Fails
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: 
  ```bash
  rm -rf node_modules
  npm install
  ```

## 📝 Development Tips

1. **Hot Reloading:**
   - Frontend: Automatically reloads on file changes
   - Backend: Use `npm run dev` for auto-reload with nodemon

2. **API Testing:**
   - Use Postman or Thunder Client to test API endpoints
   - Use the browser console to debug API calls

3. **Adding New Features:**
   - Create model in `server/models/`
   - Create controller in `server/controllers/`
   - Create route in `server/routes/`
   - Register route in `server/server.js`
   - Add API function in `client/src/services/api.js`

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ using the MERN Stack

