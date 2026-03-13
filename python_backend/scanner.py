import boto3

ec2 = boto3.client('ec2')
s3 = boto3.client('s3')

def scan_ec2():

    findings = []

    instances = ec2.describe_instances()

    for reservation in instances['Reservations']:
        for instance in reservation['Instances']:

            instance_id = instance['InstanceId']

            for sg in instance['SecurityGroups']:

                if sg['GroupName'] == "default":

                    findings.append({
                        "resource": instance_id,
                        "type": "EC2",
                        "risk": "Medium",
                        "issue": "Default security group used"
                    })

    return findings


def scan_s3():

    findings = []

    buckets = s3.list_buckets()

    for bucket in buckets['Buckets']:

        name = bucket['Name']

        try:
            acl = s3.get_bucket_acl(Bucket=name)

            for grant in acl['Grants']:

                if "AllUsers" in str(grant):

                    findings.append({
                        "resource": name,
                        "type": "S3",
                        "risk": "High",
                        "issue": "Public bucket detected"
                    })

        except:
            pass

    return findings
