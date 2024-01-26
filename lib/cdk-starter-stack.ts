import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 define lambda
    const lambdaFunction = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/my-lambda')),
    });

    // 👇 create bucket
    const s3Bucket = new s3.Bucket(this, 's3-bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 👇 invoke lambda every time an object is created
    s3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(lambdaFunction),
      // 👇 only invoke lambda if object matches the filter
      // {prefix: 'test/', suffix: '.yaml'},
    );

    new cdk.CfnOutput(this, 'bucketName', {
      value: s3Bucket.bucketName,
    });

    const queue = new sqs.Queue(this, 'sqs-queue');

    s3Bucket.addEventNotification(
      s3.EventType.OBJECT_REMOVED,
      new s3n.SqsDestination(queue),
      // 👇 only send message to queue if object matches the filter
      // {prefix: 'test/', suffix: '.png'},
    );

    new cdk.CfnOutput(this, 'queueName', {
      value: queue.queueName,
    });

    const topic = new sns.Topic(this, 'sns-topic');

    s3Bucket.addEventNotification(
      s3.EventType.REDUCED_REDUNDANCY_LOST_OBJECT,
      new s3n.SnsDestination(topic),
      // 👇 only send message to topic if object matches the filter
      // {prefix: 'test/', suffix: '.png'},
    );

    new cdk.CfnOutput(this, 'topicName', {
      value: topic.topicName,
    });
  }
}
