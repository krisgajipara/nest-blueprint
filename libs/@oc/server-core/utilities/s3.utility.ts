import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import * as https from "https";

interface S3ConfigInterface {
    access_key_id: string;
    secret_access_key: string;
    private_bucket_name: string;
    region: string;
}

@Injectable()
export class S3Utility {
    public readonly S3Config: S3ConfigInterface;
    private readonly s3: S3;
    constructor(private readonly configService: ConfigService) {
        this.S3Config = this.configService.get("aws_s3");
        this.s3 = this.getS3();
    }

    public get privateBucketName(): string {
        return this.S3Config.private_bucket_name;
    }
    // For connection to S3
    getS3() {
        return new S3({
            accessKeyId: this.S3Config.access_key_id,
            secretAccessKey: this.S3Config.secret_access_key,
            region: this.S3Config.region,
            httpOptions: {
                agent: new https.Agent({
                    rejectUnauthorized: false // Allow self-signed certificates for test environments
                })
            }
        });
    }

    /**
     * Upload images on S3 bucket
     * @param file = Image file buffer
     * @param bucket = Path of bucket/folder
     * @param name = Name of image file
     * @param mimeType = File mime type
     */
    async uploadS3(file, bucket: string, name: string, mimeType: string) {
        const params = {
            Bucket: bucket,
            Key: name,
            Body: file,
            ContentType: mimeType
        };
        return new Promise((resolve, reject) => {
            this.s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(new Error(err.message));
                }
                resolve(data);
            });
        });
    }

    /**
     * Delete file from S3 bucket
     * @param key = File Name
     * @param bucketName = Bucket/Folder path in S3
     */
    async deleteFileFromS3(key: string, bucketName: string) {
        const params = {
            Bucket: bucketName,
            Key: key
        };
        this.s3.deleteObject(params, function (err) {
            if (err) console.log(err, err.stack); // an error occurred
        });
    }
    /**
     * Get Pre Signed URL of File from S3 bucket
     * @param key = File Name
     * @param expires = Presigned URL
     * @param bucketName = Bucket/Folder path in S3
     * @param contentType
     */
    async generatePresignedUrl(key: string, expires: number, bucketName: string, contentType = null) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Expires: expires
        };
        if (contentType != null) {
            params["ResponseContentDisposition"] = `${contentType}; filename="${key}"`;
        }
        return this.s3.getSignedUrlPromise("getObject", params);
    }
}
