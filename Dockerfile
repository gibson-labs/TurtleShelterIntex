FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm ci --only=production

# Copy app source
COPY . .

# Expose the app port (container listens on 80)
EXPOSE 80

CMD ["npm", "start"]
