import boto3
import json
import uuid
import sys

def create_vulnerable_resources(access_key, secret_key, region):
    print("🚀 Initializing AWS Clients...")
    ec2 = boto3.client('ec2', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)
    s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)
    
    # 1. Create an Open Security Group (0.0.0.0/0 on Port 22 and 80)
    print("🛡️ Creating a vulnerable Security Group (Open to 0.0.0.0/0)...")
    try:
        # We need the default VPC ID to create a security group
        vpcs = ec2.describe_vpcs()
        vpc_id = vpcs['Vpcs'][0]['VpcId']
        
        sg_name = f"shadowit-test-open-sg-{uuid.uuid4().hex[:6]}"
        response = ec2.create_security_group(
            GroupName=sg_name,
            Description='Vulnerable Security Group for ShadowIT Detection Testing',
            VpcId=vpc_id
        )
        sg_id = response['GroupId']
        print(f"   ✅ Created Security Group: {sg_id} ({sg_name})")
        
        # Add Inbound Rules (Ingress)
        ec2.authorize_security_group_ingress(
            GroupId=sg_id,
            IpPermissions=[
                {
                    'IpProtocol': 'tcp',
                    'FromPort': 22,
                    'ToPort': 22,
                    'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
                },
                {
                    'IpProtocol': 'tcp',
                    'FromPort': 80,
                    'ToPort': 80,
                    'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
                }
            ]
        )
        print("   ⚠️ Added risky rules: Port 22 and 80 open to 0.0.0.0/0")
    except Exception as e:
        print(f"   ❌ Failed to create Security Group: {e}")

    # 2. Create a Public S3 Bucket
    print("\n🪣 Creating a public S3 Bucket...")
    try:
        bucket_name = f"shadowit-test-public-bucket-{uuid.uuid4().hex[:8]}"
        
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        print(f"   ✅ Created Bucket: {bucket_name}")

        # Disable Block Public Access to allow public ACLs and Policies
        s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        print("   🔓 Disabled BlockPublicAccess")

        # Set Object Ownership to BucketOwnerPreferred to allow ACLs
        s3.put_bucket_ownership_controls(
            Bucket=bucket_name,
            OwnershipControls={
                'Rules': [{'ObjectOwnership': 'BucketOwnerPreferred'}]
            }
        )
        
        # Make the bucket public using ACL
        s3.put_bucket_acl(Bucket=bucket_name, ACL='public-read')
        print("   ⚠️ Applied 'public-read' ACL to bucket")

        # Also add a public bucket policy just to be sure it flags as public
        public_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(public_policy))
        print("   ⚠️ Attached public resource policy")

    except Exception as e:
        print(f"   ❌ Failed to create Public S3 Bucket: {e}")

    print("\n🎉 Done! You can now run the ShadowGuard Risk Analysis scanner in your frontend.")
    print("The Dashboard should detect the public bucket and the open security group rules.")

if __name__ == "__main__":
    print("=== AWS Vulnerable Resource Generator ===")
    print("⚠️ WARNING: This will create publicly accessible resources in your AWS account.")
    print("Do NOT run this in a production environment. Delete resources after testing.\n")
    
    ak = input("Enter AWS Access Key: ").strip()
    sk = input("Enter AWS Secret Key: ").strip()
    reg = input("Enter AWS Region (e.g., ap-south-1): ").strip()
    
    if not ak or not sk or not reg:
        print("Error: All fields are required.")
        sys.exit(1)
        
    create_vulnerable_resources(ak, sk, reg)
