FROM node:22-alpine

WORKDIR /frontend

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
