import boto3

def scan_ec2(access_key, secret_key, region):
    findings = []
    access_key = access_key.strip()
    secret_key = secret_key.strip()
    region = region.strip()
    
    ec2 = boto3.client('ec2', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)
    instances = ec2.describe_instances()

    for reservation in instances.get('Reservations', []):
        for instance in reservation.get('Instances', []):
            instance_id = instance['InstanceId']
            
            is_vulnerable = False
            for sg in instance.get('SecurityGroups', []):
                # Check for default security group
                if sg['GroupName'] == "default":
                    findings.append({
                        "resource": instance_id,
                        "type": "EC2",
                        "risk": "Medium",
                        "issue": "Default security group used"
                    })
                    is_vulnerable = True
                    break
                
                # Check for 0.0.0.0/0 on port 22 or 80
                try:
                    sg_details = ec2.describe_security_groups(GroupIds=[sg['GroupId']])
                    full_sg = sg_details['SecurityGroups'][0]
                    for rule in full_sg.get('IpPermissions', []):
                        from_port = rule.get('FromPort')
                        for ip_range in rule.get('IpRanges', []):
                            if ip_range.get('CidrIp') == '0.0.0.0/0' and from_port in [22, 80]:
                                findings.append({
                                    "resource": instance_id,
                                    "type": "EC2",
                                    "risk": "Critical",
                                    "issue": f"Open port {from_port} to 0.0.0.0/0"
                                })
                                is_vulnerable = True
                                break
                        if is_vulnerable:
                            break
                except:
                    pass
                
                if is_vulnerable:
                    break
            
            # If no vulnerabilities were flagged, add the instance as a secure resource
            if not is_vulnerable:
                findings.append({
                    "resource": instance_id,
                    "type": "EC2",
                    "risk": "Low",
                    "issue": "Secure configuration"
                })

    return findings


def scan_s3(access_key, secret_key, region):
    findings = []
    access_key = access_key.strip()
    secret_key = secret_key.strip()
    region = region.strip()

    s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)
    buckets = s3.list_buckets()

    for bucket in buckets.get('Buckets', []):
        name = bucket['Name']
        is_vulnerable = False
        
        try:
            acl = s3.get_bucket_acl(Bucket=name)
            for grant in acl.get('Grants', []):
                if "AllUsers" in str(grant):
                    findings.append({
                        "resource": name,
                        "type": "S3",
                        "risk": "Critical",
                        "issue": "Public bucket detected"
                    })
                    is_vulnerable = True
                    break
        except:
            # We specifically catch this because get_bucket_acl might fail for individual buckets 
            # due to them lacking ACL permissions or returning AccessDenied, but we still want to scan others
            pass
            
        # If no vulnerabilities were flagged, add the bucket as a secure resource
        if not is_vulnerable:
            findings.append({
                "resource": name,
                "type": "S3",
                "risk": "Low",
                "issue": "Private bucket"
            })

    return findings
