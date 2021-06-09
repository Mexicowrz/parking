#!/bin/bash
cd /home/ubuntu/parking/project/parking
docker build -t site_parking-tmp .

    docker logs parking > /home/ubuntu/parking/logs/"park-$(date +"%Y-%m-%d %T").log"

    docker stop parking
    docker rm parking
    docker rmi site_parking

    docker tag site_parking-tmp:latest site_parking:latest
    docker rmi site_parking-tmp
    docker run --name parking -p 3000:3000 -v /home/ubuntu/parking/logs:/home/ubuntu/parking/logs --restart=always -i -t -d site_parking
