terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.15.0"

    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_id
}

data "aws_availability_zones" "available" {
}

resource "aws_security_group" "worker_group_mgmt_one" {
  name_prefix = "worker_group_mgmt_one"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "10.0.0.0/8",
    ]
  }
}

resource "aws_security_group" "all_worker_mgmt" {
  name_prefix = "all_worker_management"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16",
    ]
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.2"

  name                 = "test-vpc"
  cidr                 = "10.0.0.0/16"
  azs                  = data.aws_availability_zones.available.names
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets       = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }
}

module "eks" {
  source                          = "terraform-aws-modules/eks/aws"
  cluster_name                    = var.cluster_name
  cluster_version                 = "1.22"
  subnet_ids                      = module.vpc.private_subnets
  version                         = "~> 18.0"
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"

    attach_cluster_primary_security_group = true

    # Disabling and using externally provided security groups
    create_security_group  = false
    vpc_security_group_ids = [aws_security_group.all_worker_mgmt.id]

  }


  vpc_id = module.vpc.vpc_id

  node_security_group_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = null
  }


  # worker_groups = [
  #   {
  #     name                          = "worker-group-1"
  #     instance_type                 = "t2.small"
  #     additional_userdata           = "echo foo bar"
  #     asg_desired_capacity          = 1
  #     additional_security_group_ids = [aws_security_group.worker_group_mgmt_one.id]
  #   },
  # ]

  # worker_additional_security_group_ids = [aws_security_group.all_worker_mgmt.id]
  # map_roles                            = var.map_roles
  # map_users                            = var.map_users
  # map_accounts                         = var.map_accounts


  eks_managed_node_groups = {
    one = {
      name = "node-group-1"

      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 3
      desired_size = 2

      pre_bootstrap_user_data = <<-EOT
      echo 'foo bar'
      EOT

      vpc_security_group_ids = [
      aws_security_group.worker_group_mgmt_one.id]
    }

    two = {
      name = "node-group-2"

      instance_types = ["t3.medium"]

      min_size     = 1
      max_size     = 2
      desired_size = 1

      pre_bootstrap_user_data = <<-EOT
      echo 'foo bar'
      EOT

      vpc_security_group_ids = [
      aws_security_group.worker_group_mgmt_one.id]
    }
  }

}



provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.cluster.token
  # load_config_file       = false
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name = "backend"
    labels = {
      app = "backend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          image = "573718985267.dkr.ecr.us-east-1.amazonaws.com/backend:latest"
          name  = "node-backend"
          port {
            container_port = 3001
          }

          # resources {
          #   limits {
          #     cpu    = "0.5"
          #     memory = "512Mi"
          #   }
          #   requests {
          #     cpu    = "250m"
          #     memory = "50Mi"
          #   }
          # }
        }
      }
    }
  }
}

resource "kubernetes_service" "node-service" {
  metadata {
    name = "backend"
  }
  spec {
    selector = {
      app = "backend"
    }
    port {
      port        = 80
      target_port = 3001
    }

    type = "LoadBalancer"
  }
}
