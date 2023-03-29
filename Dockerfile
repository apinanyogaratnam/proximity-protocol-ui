FROM caddy:2.6.4-alpine

# ARG COMMIT_SHA
# ENV COMMIT_SHA=${COMMIT_SHA}
# ARG NODE_ENV
# ENV NODE_ENV=${NODE_ENV}
# ARG ENVIRONMENT
# ENV ENVIRONMENT=${ENVIRONMENT}
ARG VITE_REACT_APP_DEPLOY_VERSION
ENV VITE_REACT_APP_DEPLOY_VERSION=${VITE_REACT_APP_DEPLOY_VERSION}
ARG VITE_REACT_APP_DEPLOY_ENVIRONMENT
ENV VITE_REACT_APP_DEPLOY_ENVIRONMENT=${VITE_REACT_APP_DEPLOY_ENVIRONMENT}
ARG VITE_REACT_APP_ANALYTICS_KEY
ENV VITE_REACT_APP_ANALYTICS_KEY=${VITE_REACT_APP_ANALYTICS_KEY}
ARG VITE_IPFS_API_KEY
ENV VITE_IPFS_API_KEY=${VITE_IPFS_API_KEY}
ARG VITE_ETHERSCAN_API_KEY
ENV VITE_ETHERSCAN_API_KEY=${VITE_ETHERSCAN_API_KEY}
ARG VITE_INFURA_GOERLI_PROJECT_ID
ENV VITE_INFURA_GOERLI_PROJECT_ID=${VITE_INFURA_GOERLI_PROJECT_ID}
ARG VITE_INFURA_MAINNET_PROJECT_ID
ENV VITE_INFURA_MAINNET_PROJECT_ID=${VITE_INFURA_MAINNET_PROJECT_ID}
ARG NODE_OPTIONS
ENV NODE_OPTIONS=${NODE_OPTIONS}

## Copy Caddyfile to Caddy
COPY caddyfile.webapp.dev /etc/caddy/Caddyfile
## Copy generated static site to Caddy
WORKDIR /website
COPY packages/web-app/dist .
EXPOSE 9080