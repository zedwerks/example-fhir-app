#!/bin/bash

cd app
# Build the image
docker build -t fhir-server .

# Run the container
docker run -d -p 9000:9000 fhir-server

cd ..