# Seagulls Tech - MERN Stack Application

A comprehensive asset management system built with the MERN (MongoDB, Express.js, React.js, Node.js) stack, featuring user authentication, role-based access control, and asset tracking capabilities.

## Project Structure

```
seagulls-tech/
├── backend/           # Backend server
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── uploads/      # File uploads directory
│   ├── utils/        # Utility functions
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── nodemon.json  # Development server configuration
├── frontend/         # Frontend application
│   ├── public/       # Static files
│   ├── src/          # React source code
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── utils/       # Frontend utilities
│   ├── package.json     # Frontend dependencies
│   └── .gitignore       # Frontend gitignore
└── README.md            # Project documentation
```

## Features

- **User Authentication**
  - Secure login and registration
  - JWT-based authentication
  - Password reset functionality
  - Role-based access control (Admin, Technician)

- **Asset Management**
  - Asset tracking and monitoring
  - QR code generation for assets
  - Asset status updates
  - Asset history tracking

- **User Management**
  - Admin and technician management
  - Profile management
  - Password updates
  - Session management

- **Responsive Design**
  - Mobile-friendly interface
  - Bootstrap-based UI components
  - Modern and intuitive design

## Setup Instructions

### Backend Setup

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

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication
  - Bcrypt for password hashing
  - Multer for file uploads

- **Frontend:**
  - React.js
  - React Router
  - Axios for API calls
  - Bootstrap 5
  - React Icons
  - SweetAlert2 for modals
  - React Table for data display

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### Users
- `GET /admin` - Get all admins
- `POST /admin` - Create new admin
- `PUT /admin/:id` - Update admin
- `DELETE /admin/:id` - Delete admin
- `PUT /admin/update-password/:id` - Update admin password

### Technicians
- `GET /tech` - Get all technicians
- `POST /tech` - Create new technician
- `PUT /tech/:id` - Update technician
- `DELETE /tech/:id` - Delete technician
- `PUT /tech/update-password/:id` - Update technician password

### Assets
- `GET /asset` - Get all assets
- `POST /asset` - Create new asset
- `PUT /asset/:id` - Update asset
- `DELETE /asset/:id` - Delete asset
- `GET /asset/:id` - Get asset details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 