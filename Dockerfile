FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm ci --only=production

# Copy app source
COPY . .

# Expose the app port (defaults to 5001 in code if PORT is not set)
EXPOSE 80

CMD ["npm", "start"]
