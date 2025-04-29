module "vpc" {
  source = "./modules/vpc"
  
  vpc_name        = "my-vpc"
  vpc_cidr        = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "ec2" {
  source = "./modules/ec2"
  
  ami           = "ami-086a54924e40cab98"  # Amazon Linux 2
  instance_type = "t4g.nano"
  subnet_id     = module.vpc.public_subnet_ids[0]
  vpc_security_group_ids = [module.vpc.security_group_id]
  key_name      = "terraform"  # Update with your SSH key pair name - create this in AWS console
}