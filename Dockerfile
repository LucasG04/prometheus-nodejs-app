FROM node:14

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code to the working directory
COPY . .

EXPOSE 8080
CMD ["npm", "start"]