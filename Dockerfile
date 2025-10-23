# Uses node 20 alpine image for apk package manager
FROM node:alpine

# Installs required system dependencies
RUN apk add --no-cache python3 make g++ git curl unzip

# Sets 1pwd cli version
ENV OP_VERSION=2.32.0

# Installs 1pwd cli
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
        x86_64) OP_ARCH=amd64 ;; \
        aarch64) OP_ARCH=arm64 ;; \
        armv7l) OP_ARCH=arm ;; \
        i686) OP_ARCH=386 ;; \
        *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac && \
    echo "Installing 1Password CLI for architecture: $OP_ARCH" && \
    curl -fsSL https://cache.agilebits.com/dist/1P/op2/pkg/v${OP_VERSION}/op_linux_${OP_ARCH}_v${OP_VERSION}.zip -o /tmp/op.zip && \
    unzip /tmp/op.zip -d /tmp/op && \
    mv /tmp/op/op /usr/local/bin/ && \
    rm -rf /tmp/op /tmp/op.zip

# Confirms 1pwd cli installation
RUN op --version

# Sets the environment variable to point to Python
ENV PYTHON python3

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to the Docker environment
COPY package.json package-lock.json ./

# Installs required dependencies
RUN npm install

# Copies contents
COPY . .

# Stars the application
CMD npm start
