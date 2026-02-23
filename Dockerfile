#FROM node:alpine3.16

FROM node:lts-alpine3.22

# Install Chromium and minimal dependencies for headless use (e.g., Puppeteer)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-cjk \
    font-noto-emoji

# Point Puppeteer to the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
  
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Build the Next.js application
RUN npm run build

# Run the code with npm run start
CMD ["npm", "start"]

