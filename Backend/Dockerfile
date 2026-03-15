FROM node:20-alpine

# Install Python3 using Alpine's pre-compiled packages (no C compiler needed)
# All packages below have pre-built Alpine binaries - no compilation required
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-numpy \
    py3-pandas \
    py3-scikit-learn

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Make the entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose the Express server port
EXPOSE 5000

# Use entrypoint that runs schema migration then starts the server
CMD ["sh", "docker-entrypoint.sh"]
