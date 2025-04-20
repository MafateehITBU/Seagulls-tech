# Seagulls Tech - MERN Stack Application

This is a full-stack application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack.

## Project Structure

```
seagulls-tech/
├── backend/           # Backend server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables
└── README.md         # Project documentation
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/seagulls-tech
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication
  - Bcrypt for password hashing

## API Endpoints

- `GET /` - Welcome message
- More endpoints will be added as the project progresses

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 