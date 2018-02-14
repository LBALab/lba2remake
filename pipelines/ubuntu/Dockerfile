# debian distribution
FROM ubuntu:latest

# base applications
RUN apt-get update 
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y curl apt-transport-https ca-certificates && curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_6.x && bash setup-nodejs && apt-get install -y nodejs build-essential
RUN apt-get -y upgrade

RUN apt-get install -y git
RUN apt-get install -y git-ftp
RUN apt-get install -y build-essential libssl-dev
RUN apt-get install -y aptitude
RUN aptitude install -y npm

RUN curl https://raw.githubusercontent.com/git-ftp/git-ftp/master/git-ftp > /usr/bin/git-ftp

# game dependencies
RUN npm install -g express@4.16.2
RUN npm install -g flow-bin@0.33.0
RUN npm install -g flow-status-webpack-plugin@0.1.7
RUN npm install -g json-loader@0.5.7
RUN npm install -g node-libs-browser@1.0.0
RUN npm install -g raw-loader@0.5.1
RUN npm install -g webpack@1.12.15
RUN npm install -g webpack-dev-server@1.14.1
RUN npm install -g webpack-express-middleware@1.2.1
RUN npm install -g babel-core@6.7.6
RUN npm install -g babel-loader@6.2.4
RUN npm install -g babel-plugin-transform-class-properties@6.16.0
RUN npm install -g babel-plugin-transform-flow-strip-types@6.14.0
RUN npm install -g babel-preset-es2015@6.16.0
RUN npm install -g babel-preset-react@6.5.0
