FROM node:20

ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:99

# # Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    lsof \ 
    apt-transport-https \
    ca-certificates \
    x11-utils xdg-utils xvfb \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Add the Google Chrome repository
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list

# Install Google Chrome
RUN apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY release/ ./release/
COPY .erb/ ./.erb/

RUN npm install
COPY . .


EXPOSE 8000

# Start Xvfb and then the app
CMD Xvfb :99 -ac -screen 0 1280x1024x16 & npm run k8s:worker