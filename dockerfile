# ---- Runtime (single stage is fine for Express/EJS) ----
FROM node:20-alpine

# Security / perf basics
ENV NODE_ENV=production
ENV PORT=80
WORKDIR /app

# Install dependencies first (leverage cache)
COPY package*.json ./
# If you have devDependencies needed for build, use `npm ci` then `npm prune --omit=dev`
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# If you have a build step (e.g., TypeScript or asset bundling), uncomment:
# RUN npm run build

# Make sure your package.json has:  "start": "node server.js"  (or your entry)
# If you previously used Procfile ("web: npm start"), this matches that.
EXPOSE 80
USER node
CMD ["npm", "start"]
