# 1. Base image - manjša, alpine verzija
FROM node:20-alpine

# 2. Nastavi delovni direktorij
WORKDIR /app

# 3. Kopiraj package.json in package-lock.json
COPY package*.json ./

# 4. Namesti odvisnosti
RUN npm install --production

# 5. Kopiraj preostalo kodo
COPY . .

# 6. Nastavi port (isti kot v tvoji aplikaciji)
EXPOSE 3003

# 7. Zaženi aplikacijo
CMD ["node", "app.js"]
