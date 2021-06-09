FROM node:14

RUN npm install pm2 -g

# Use unicode
#RUN locale-gen C.UTF-8 || true
#ENV LANG=C.UTF-8

# Locale
#RUN sed -i -e \
#  's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen \
#   && locale-gen

ENV LANG ru_RU.UTF-8
ENV LANGUAGE ru_RU:ru
ENV LC_LANG ru_RU.UTF-8
ENV LC_ALL ru_RU.UTF-8


WORKDIR /app
COPY . .

WORKDIR /app

#WORKDIR /app/client
#RUN yarn && yarn build

WORKDIR /app/back
RUN yarn && yarn build

WORKDIR /app

CMD pm2-runtime process.json