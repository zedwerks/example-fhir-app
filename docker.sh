#!/bin/bash

cd app
# Build the image
docker build -t demo-smart-app .

# Run the container
docker run -d -p 3000:3000 demo-fhir-app

cd ..