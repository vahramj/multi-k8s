docker build -t vahramj/multi-client:latest -t vahramj/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t vahramj/multi-server:latest -t vahramj/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t vahramj/multi-worker:latest -t vahramj/multi-worker:$SHA -f ./server/Dockerfile ./worker

docker push vahramj/multi-client:latest
docker push vahramj/multi-server:latest
docker push vahramj/multi-worker:latest

docker push vahramj/multi-client:$SHA
docker push vahramj/multi-server:$SHA
docker push vahramj/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment client=vahramj/multi-client:$SHA
kubectl set image deployments/server-deployment server=vahramj/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=vahramj/multi-worker:$SHA