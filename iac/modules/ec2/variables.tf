variable "ami" {
  description = "AMI ID for the EC2 instance"
  type        = string
  # aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 --region us-east-1 --query 'Parameters[0].[Value]' --output text
  # default   =  "ami-065aeacd44e98d9ac"
   default    =  "ami-0003587eff209a1d8"
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID to launch the instance in"
  type        = string
}

variable "vpc_security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "key_name" {
  description = "Key pair name"
  type        = string
}