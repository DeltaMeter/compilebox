
echo "Creating Docker Image"
docker build -t 'grading_machine' .
echo "Retrieving Installed Docker Images"
docker images
