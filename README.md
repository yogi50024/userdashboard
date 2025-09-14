# User Dashboard Backend Service

A comprehensive Node.js/Express microservice backend for a healthcare and wellness user dashboard platform. This production-ready service provides extensive healthcare, emergency, and wellness management features with robust security and scalability.

## 🚀 Features

### 🆘 Emergency Services
- **SOS Alerts**: Quick emergency alerts with location sharing
- **Emergency Contacts Management**: CRUD operations for emergency contacts
- **Medication & Appointment Reminders**: Intelligent scheduling system with notifications

### 🏥 Medical Services
- **Doctor Management**: Browse and book appointments with healthcare providers
- **Appointment Booking**: Support for in-person, online, and phone consultations
- **Lab Test Booking**: Home collection and lab visit options
- **Virtual Queue System**: Real-time queue monitoring
- **Pharmacy Services**: Prescription ordering and delivery tracking
- **Patient Transfer**: Ambulance and medical transport arrangements
- **Vaccination Scheduling**: Self and family vaccination management

### 🏠 Home Services
- **House Help Booking**: Professional cleaning and maintenance services
- **Companionship Services**: Elderly care and companionship
- **Non-Emergency Assistance**: Various support request types

### 💪 Health & Wellness
- **Diet Planning**: Personalized nutrition plans
- **Exercise Programs**: Structured fitness routines
- **Yoga & Meditation**: Guided sessions and resources
- **Progress Tracking**: Comprehensive wellness monitoring

### 👨‍👩‍👧‍👦 Family Management
- **Family Member Profiles**: Complete CRUD for family members
- **Medical History Management**: Shared medical records with permissions
- **Health Permissions**: Granular access control for family health data

### 🛠️ User Support
- **Dispute Management**: Issue filing and resolution system
- **Support Tickets**: Customer support with message threading
- **FAQ System**: Searchable knowledge base

### 👤 Profile Management
- **Personal Information**: Complete user profile management
- **Medical History**: Personal health records
- **Insurance Management**: Insurance details and claims
- **Preference Settings**: Customizable user preferences

## 🛠️ Tech Stack

- **Runtime**: Node.js (16+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer
- **Validation**: Joi & Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Process Management**: PM2
- **Web Server**: Nginx (reverse proxy)

## 📋 Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- Redis 6+
- RabbitMQ 3.8+
- Nginx (for production)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yogi50024/userdashboard.git
   cd userdashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services** (using Docker Compose - optional)
   ```bash
   # Start PostgreSQL, Redis, and RabbitMQ
   docker-compose up -d postgres redis rabbitmq
   ```

5. **Database setup**
   ```bash
   npm run migrate
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Production Deployment (Ubuntu EC2)

For automated production deployment on Ubuntu EC2:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script will:
- Install all dependencies (Node.js, PostgreSQL, Redis, RabbitMQ, Nginx)
- Configure system services
- Set up PM2 for process management
- Configure Nginx as reverse proxy
- Set up SSL-ready configuration
- Configure log rotation and monitoring

## 📚 API Documentation

### Base URL
```
Production: https://your-domain.com/api/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /auth/profile` - Get user profile

#### Emergency Services
- `POST /emergency/contacts` - Create emergency contact
- `GET /emergency/contacts` - List emergency contacts
- `POST /emergency/sos` - Create SOS alert
- `GET /emergency/sos` - List SOS alerts
- `POST /emergency/reminders` - Create reminder
- `GET /emergency/reminders` - List reminders

#### Medical Services
- `GET /medical/doctors` - List doctors
- `POST /medical/appointments` - Book appointment
- `GET /medical/appointments` - List appointments
- `POST /medical/lab-bookings` - Book lab test
- `POST /medical/prescriptions` - Order prescription
- `POST /medical/transfers` - Request patient transfer
- `POST /medical/vaccination-bookings` - Book vaccination

#### Home Services
- `GET /home-services/services` - List home services
- `POST /home-services/bookings` - Book home service
- `GET /home-services/bookings` - List bookings
- `POST /home-services/assistance` - Create assistance request

#### Health & Wellness
- `GET /wellness/diet-plans` - List diet plans
- `GET /wellness/exercise-programs` - List exercise programs
- `GET /wellness/yoga-sessions` - List yoga sessions
- `POST /wellness/subscriptions` - Subscribe to wellness program

#### Family Management
- `POST /family/members` - Add family member
- `GET /family/members` - List family members
- `POST /family/medical-history` - Add medical history
- `POST /family/permissions` - Grant health permission

#### Support
- `POST /support/disputes` - File dispute
- `POST /support/tickets` - Create support ticket
- `GET /support/faqs` - List FAQs
- `GET /support/search` - Search support content

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_NAME=user_dashboard
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# External Services
GOOGLE_MAPS_API_KEY=your-api-key
SMS_API_KEY=your-sms-api-key
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Load Balancer │    │     CDN         │
│  (Reverse Proxy)│    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express App   │    │   Express App   │    │   Static Files  │
│   (PM2 Cluster) │    │   (PM2 Cluster) │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────────────────────────────┐
│            PostgreSQL                   │
│         (Primary Database)              │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│     Redis       │    │    RabbitMQ     │
│   (Caching)     │    │  (Messaging)    │
└─────────────────┘    └─────────────────┘
```

## 📊 Monitoring & Logging

### Health Checks
- Application health: `GET /health`
- API health: `GET /api/v1/health`

### Logging
- Application logs: `/opt/userdashboard/logs/`
- Access logs: `/var/log/nginx/`
- System logs: `journalctl -u userdashboard`

### PM2 Monitoring
```bash
pm2 status           # Process status
pm2 logs             # View logs
pm2 monit            # Real-time monitoring
pm2 reload all       # Reload application
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** (100 requests per 15 minutes)
- **Input Validation** using Joi and Express Validator
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** with Helmet
- **CORS Configuration** for cross-origin requests
- **Password Hashing** with bcrypt
- **File Upload Security** with type validation
- **Environment Variable Protection**

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance

- **Clustering** with PM2 for multi-core utilization
- **Redis Caching** for frequently accessed data
- **Database Indexing** for optimized queries
- **Nginx Compression** and static file serving
- **Connection Pooling** for database connections

## 🚀 Deployment Options

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
Follow the Ubuntu deployment script or deploy manually:

1. Install dependencies
2. Configure database
3. Set up environment variables
4. Start with PM2
5. Configure Nginx

### Cloud Deployment
- **AWS EC2**: Use provided deployment script
- **DigitalOcean**: Compatible with Ubuntu droplets
- **Google Cloud**: VM instances with Ubuntu
- **Azure**: Ubuntu virtual machines

## 🔄 API Versioning

Current API version: `v1`
- All endpoints prefixed with `/api/v1`
- Backward compatibility maintained
- Deprecation notices for version changes

## 📋 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the FAQ section
- Contact the development team

## 🚀 Roadmap

- [ ] GraphQL API support
- [ ] Real-time notifications with WebSockets
- [ ] Mobile app API optimization
- [ ] Advanced analytics and reporting
- [ ] AI-powered health recommendations
- [ ] Integration with wearable devices
- [ ] Telemedicine video calling
- [ ] Multi-language support

---

**Built with ❤️ for better healthcare management**
