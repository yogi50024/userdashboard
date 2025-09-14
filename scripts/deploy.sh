#!/bin/bash

# User Dashboard Backend Deployment Script for Ubuntu EC2
# This script sets up the complete environment for the User Dashboard backend

set -e

echo "🚀 Starting User Dashboard Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
echo "📦 Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install RabbitMQ
echo "📦 Installing RabbitMQ..."
sudo apt-get install -y rabbitmq-server
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create application user
echo "👤 Creating application user..."
sudo useradd -m -s /bin/bash userdashboard || true
sudo usermod -aG sudo userdashboard

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /opt/userdashboard
sudo chown userdashboard:userdashboard /opt/userdashboard

# Switch to application user context for the rest of the setup
sudo -u userdashboard bash << 'EOF'
cd /opt/userdashboard

# Clone the repository (replace with your actual repository URL)
echo "📥 Cloning repository..."
git clone https://github.com/yogi50024/userdashboard.git .

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --production

# Create necessary directories
mkdir -p logs uploads

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cp .env.example .env

echo "Please edit /opt/userdashboard/.env with your actual configuration values"
EOF

# Set up PostgreSQL database
echo "🗄️ Setting up PostgreSQL database..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE user_dashboard;
CREATE USER userdashboard WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE user_dashboard TO userdashboard;
\q
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/userdashboard > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Proxy to Node.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /uploads {
        alias /opt/userdashboard/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3000/health;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/userdashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 ecosystem file..."
sudo -u userdashboard tee /opt/userdashboard/ecosystem.config.js > /dev/null << 'EOF'
module.exports = {
  apps: [{
    name: 'user-dashboard-backend',
    script: 'src/app.js',
    cwd: '/opt/userdashboard',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/userdashboard/logs/err.log',
    out_file: '/opt/userdashboard/logs/out.log',
    log_file: '/opt/userdashboard/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
EOF

# Create systemd service for PM2
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/userdashboard.service > /dev/null << 'EOF'
[Unit]
Description=User Dashboard Backend
After=network.target

[Service]
Type=forking
User=userdashboard
WorkingDirectory=/opt/userdashboard
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 delete ecosystem.config.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Set up log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/userdashboard > /dev/null << 'EOF'
/opt/userdashboard/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 userdashboard userdashboard
    postrotate
        sudo -u userdashboard /usr/bin/pm2 reloadLogs
    endscript
}
EOF

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for future SSL setup)
sudo ufw --force enable

# Set proper file permissions
echo "🔒 Setting file permissions..."
sudo chown -R userdashboard:userdashboard /opt/userdashboard
sudo chmod -R 755 /opt/userdashboard
sudo chmod 600 /opt/userdashboard/.env

# Start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable userdashboard
sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/userdashboard/.env with your actual configuration"
echo "2. Run database migrations: cd /opt/userdashboard && npm run migrate"
echo "3. Start the application: sudo systemctl start userdashboard"
echo "4. Check application status: sudo systemctl status userdashboard"
echo "5. View logs: sudo -u userdashboard pm2 logs"
echo ""
echo "🌐 Your application will be available at http://your-server-ip"
echo "📊 Health check: http://your-server-ip/api/v1/health"
echo ""
echo "🔧 Useful commands:"
echo "- Start: sudo systemctl start userdashboard"
echo "- Stop: sudo systemctl stop userdashboard"
echo "- Restart: sudo systemctl restart userdashboard"
echo "- Status: sudo systemctl status userdashboard"
echo "- Logs: sudo -u userdashboard pm2 logs"
echo "- Nginx logs: sudo tail -f /var/log/nginx/error.log"