const { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand } = require('@aws-sdk/client-ec2');
const { S3Client, ListBucketsCommand, GetBucketAclCommand, GetPublicAccessBlockCommand } = require('@aws-sdk/client-s3');
const { IAMClient, ListUsersCommand, ListAccessKeysCommand, GetAccessKeyLastUsedCommand } = require('@aws-sdk/client-iam');
const { RDSClient, DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');
const { LambdaClient, ListFunctionsCommand } = require('@aws-sdk/client-lambda');

/**
 * Create AWS clients with user-provided credentials
 */
function createClients(accessKeyId, secretAccessKey, region) {
  const credentials = { accessKeyId, secretAccessKey };
  return {
    ec2: new EC2Client({ region, credentials }),
    s3: new S3Client({ region, credentials }),
    iam: new IAMClient({ region: 'us-east-1', credentials }), // IAM is global
    rds: new RDSClient({ region, credentials }),
    lambda: new LambdaClient({ region, credentials }),
  };
}

/**
 * Scan EC2 instances for security issues
 */
async function scanEC2(ec2Client) {
  const findings = [];
  try {
    // Check instances
    const instances = await ec2Client.send(new DescribeInstancesCommand({}));
    for (const reservation of instances.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        const instanceId = instance.InstanceId;

        // Check if instance has public IP
        if (instance.PublicIpAddress) {
          findings.push({
            id: instanceId,
            service: 'EC2',
            riskLevel: 'Medium',
            issue: `Instance has public IP address: ${instance.PublicIpAddress}`,
            fix: 'Consider placing instance behind a load balancer or using private subnet',
          });
        }
      }
    }

    // Check security groups
    const sgResponse = await ec2Client.send(new DescribeSecurityGroupsCommand({}));
    for (const sg of sgResponse.SecurityGroups || []) {
      for (const rule of sg.IpPermissions || []) {
        for (const ipRange of rule.IpRanges || []) {
          if (ipRange.CidrIp === '0.0.0.0/0') {
            const port = rule.FromPort || 'All';
            let riskLevel = 'Medium';
            let issue = `Security group ${sg.GroupId} allows inbound from 0.0.0.0/0 on port ${port}`;

            // SSH or RDP open to world = Critical
            if (port === 22 || port === 3389) {
              riskLevel = 'Critical';
              issue = `Security group ${sg.GroupId} allows ${port === 22 ? 'SSH' : 'RDP'} access from 0.0.0.0/0`;
            }

            findings.push({
              id: sg.GroupId,
              service: 'EC2',
              riskLevel,
              issue,
              fix: `Restrict port ${port} to specific CIDR blocks or IP addresses`,
            });
          }
        }
      }
    }
  } catch (error) {
    findings.push({
      id: 'ec2-scan-error',
      service: 'EC2',
      riskLevel: 'Low',
      issue: `Could not complete EC2 scan: ${error.message}`,
      fix: 'Ensure IAM credentials have ec2:Describe* permissions',
    });
  }
  return findings;
}

/**
 * Scan S3 buckets for security issues
 */
async function scanS3(s3Client) {
  const findings = [];
  try {
    const buckets = await s3Client.send(new ListBucketsCommand({}));
    for (const bucket of buckets.Buckets || []) {
      const bucketName = bucket.Name;

      // Check public access block
      try {
        const publicAccess = await s3Client.send(
          new GetPublicAccessBlockCommand({ Bucket: bucketName })
        );
        const config = publicAccess.PublicAccessBlockConfiguration;
        if (!config.BlockPublicAcls || !config.BlockPublicPolicy || !config.IgnorePublicAcls || !config.RestrictPublicBuckets) {
          findings.push({
            id: bucketName,
            service: 'S3',
            riskLevel: 'Critical',
            issue: 'Bucket does not have all public access blocks enabled',
            fix: 'Enable Block Public Access for all settings on this bucket',
          });
        }
      } catch (err) {
        if (err.name === 'NoSuchPublicAccessBlockConfiguration') {
          findings.push({
            id: bucketName,
            service: 'S3',
            riskLevel: 'Critical',
            issue: 'Bucket has no public access block configuration',
            fix: 'Enable Block Public Access settings on this bucket',
          });
        }
      }

      // Check ACL
      try {
        const acl = await s3Client.send(new GetBucketAclCommand({ Bucket: bucketName }));
        for (const grant of acl.Grants || []) {
          if (grant.Grantee && grant.Grantee.URI &&
              grant.Grantee.URI.includes('AllUsers')) {
            findings.push({
              id: bucketName,
              service: 'S3',
              riskLevel: 'Critical',
              issue: 'Bucket ACL grants public access (AllUsers)',
              fix: 'Remove public ACL grants and use bucket policies with specific principals',
            });
          }
        }
      } catch (err) {
        // ACL check failed, skip
      }
    }
  } catch (error) {
    findings.push({
      id: 's3-scan-error',
      service: 'S3',
      riskLevel: 'Low',
      issue: `Could not complete S3 scan: ${error.message}`,
      fix: 'Ensure IAM credentials have s3:List* and s3:GetBucket* permissions',
    });
  }
  return findings;
}

/**
 * Scan IAM users for security issues
 */
async function scanIAM(iamClient) {
  const findings = [];
  try {
    const usersResponse = await iamClient.send(new ListUsersCommand({}));
    const now = new Date();

    for (const user of usersResponse.Users || []) {
      // Check access keys
      try {
        const keysResponse = await iamClient.send(
          new ListAccessKeysCommand({ UserName: user.UserName })
        );
        for (const key of keysResponse.AccessKeyMetadata || []) {
          // Check key age
          const keyAge = (now - new Date(key.CreateDate)) / (1000 * 60 * 60 * 24);
          if (keyAge > 90) {
            findings.push({
              id: `${user.UserName}/${key.AccessKeyId}`,
              service: 'IAM',
              riskLevel: keyAge > 180 ? 'Critical' : 'Medium',
              issue: `Access key is ${Math.floor(keyAge)} days old (not rotated)`,
              fix: 'Rotate access keys and enforce a key rotation policy',
            });
          }

          // Check last used
          try {
            const lastUsed = await iamClient.send(
              new GetAccessKeyLastUsedCommand({ AccessKeyId: key.AccessKeyId })
            );
            if (!lastUsed.AccessKeyLastUsed || !lastUsed.AccessKeyLastUsed.LastUsedDate) {
              findings.push({
                id: `${user.UserName}/${key.AccessKeyId}`,
                service: 'IAM',
                riskLevel: 'Medium',
                issue: 'Access key has never been used',
                fix: 'Remove unused access keys to reduce attack surface',
              });
            }
          } catch (err) {
            // Skip
          }
        }
      } catch (err) {
        // Skip
      }

      // Check if user has MFA
      // Note: Would need ListMFADevices but keeping simple
    }
  } catch (error) {
    findings.push({
      id: 'iam-scan-error',
      service: 'IAM',
      riskLevel: 'Low',
      issue: `Could not complete IAM scan: ${error.message}`,
      fix: 'Ensure IAM credentials have iam:List* and iam:Get* permissions',
    });
  }
  return findings;
}

/**
 * Scan RDS instances for security issues
 */
async function scanRDS(rdsClient) {
  const findings = [];
  try {
    const dbInstances = await rdsClient.send(new DescribeDBInstancesCommand({}));
    for (const db of dbInstances.DBInstances || []) {
      const dbId = db.DBInstanceIdentifier;

      // Check if publicly accessible
      if (db.PubliclyAccessible) {
        findings.push({
          id: dbId,
          service: 'RDS',
          riskLevel: 'Critical',
          issue: 'Database instance is publicly accessible',
          fix: 'Disable public accessibility and use VPC endpoints or bastion hosts',
        });
      }

      // Check if storage is encrypted
      if (!db.StorageEncrypted) {
        findings.push({
          id: dbId,
          service: 'RDS',
          riskLevel: 'Medium',
          issue: 'Database storage is not encrypted at rest',
          fix: 'Enable encryption at rest using AWS KMS',
        });
      }

      // Check if auto minor version upgrade is disabled
      if (!db.AutoMinorVersionUpgrade) {
        findings.push({
          id: dbId,
          service: 'RDS',
          riskLevel: 'Low',
          issue: 'Auto minor version upgrade is disabled',
          fix: 'Enable auto minor version upgrade for security patches',
        });
      }

      // Check backup retention
      if (db.BackupRetentionPeriod < 7) {
        findings.push({
          id: dbId,
          service: 'RDS',
          riskLevel: 'Medium',
          issue: `Backup retention period is only ${db.BackupRetentionPeriod} days`,
          fix: 'Increase backup retention period to at least 7 days',
        });
      }
    }
  } catch (error) {
    findings.push({
      id: 'rds-scan-error',
      service: 'RDS',
      riskLevel: 'Low',
      issue: `Could not complete RDS scan: ${error.message}`,
      fix: 'Ensure IAM credentials have rds:Describe* permissions',
    });
  }
  return findings;
}

/**
 * Scan Lambda functions for security issues
 */
async function scanLambda(lambdaClient) {
  const findings = [];
  try {
    const functions = await lambdaClient.send(new ListFunctionsCommand({}));
    for (const fn of functions.Functions || []) {
      const fnName = fn.FunctionName;

      // Check runtime deprecation
      const deprecatedRuntimes = ['python2.7', 'python3.6', 'nodejs10.x', 'nodejs12.x', 'dotnetcore2.1', 'ruby2.5'];
      if (deprecatedRuntimes.includes(fn.Runtime)) {
        findings.push({
          id: fnName,
          service: 'Lambda',
          riskLevel: 'Medium',
          issue: `Function uses deprecated runtime: ${fn.Runtime}`,
          fix: 'Upgrade to a supported runtime version',
        });
      }

      // Check if function has environment variables (potential secrets)
      if (fn.Environment && fn.Environment.Variables) {
        const envKeys = Object.keys(fn.Environment.Variables);
        const sensitivePatterns = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN', 'CREDENTIAL'];
        for (const key of envKeys) {
          if (sensitivePatterns.some((pattern) => key.toUpperCase().includes(pattern))) {
            findings.push({
              id: fnName,
              service: 'Lambda',
              riskLevel: 'Medium',
              issue: `Function has potentially sensitive env variable: ${key}`,
              fix: 'Use AWS Secrets Manager or Parameter Store instead of env variables for secrets',
            });
            break;
          }
        }
      }

      // Check timeout
      if (fn.Timeout > 300) {
        findings.push({
          id: fnName,
          service: 'Lambda',
          riskLevel: 'Low',
          issue: `Function timeout is set to ${fn.Timeout}s (unusually high)`,
          fix: 'Review if this high timeout is necessary; reduce to minimize cost',
        });
      }
    }
  } catch (error) {
    findings.push({
      id: 'lambda-scan-error',
      service: 'Lambda',
      riskLevel: 'Low',
      issue: `Could not complete Lambda scan: ${error.message}`,
      fix: 'Ensure IAM credentials have lambda:List* permissions',
    });
  }
  return findings;
}

/**
 * Run full security scan across all services
 */
async function runFullScan(accessKeyId, secretAccessKey, region) {
  const clients = createClients(accessKeyId, secretAccessKey, region);

  // Run all scans in parallel
  const [ec2Findings, s3Findings, iamFindings, rdsFindings, lambdaFindings] = await Promise.all([
    scanEC2(clients.ec2),
    scanS3(clients.s3),
    scanIAM(clients.iam),
    scanRDS(clients.rds),
    scanLambda(clients.lambda),
  ]);

  const allFindings = [
    ...ec2Findings,
    ...s3Findings,
    ...iamFindings,
    ...rdsFindings,
    ...lambdaFindings,
  ];

  // Compute summary
  const summary = {
    totalResources: allFindings.length,
    critical: allFindings.filter((f) => f.riskLevel === 'Critical').length,
    medium: allFindings.filter((f) => f.riskLevel === 'Medium').length,
    low: allFindings.filter((f) => f.riskLevel === 'Low').length,
    services: {
      EC2: allFindings.filter((f) => f.service === 'EC2').length,
      S3: allFindings.filter((f) => f.service === 'S3').length,
      IAM: allFindings.filter((f) => f.service === 'IAM').length,
      RDS: allFindings.filter((f) => f.service === 'RDS').length,
      Lambda: allFindings.filter((f) => f.service === 'Lambda').length,
    },
    scannedAt: new Date().toISOString(),
    region,
  };

  return { findings: allFindings, summary };
}

module.exports = { runFullScan };
