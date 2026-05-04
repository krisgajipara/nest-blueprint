import { S3 } from "aws-sdk";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as https from "https";

interface S3ConfigInterface {
    access_key_id: string;
    secret_access_key: string;
    private_bucket_name: string;
    region: string;
}

/**
 * S3 Service for AWS S3 operations
 * Handles file uploads, deletions, and presigned URL generation
 */
@Injectable()
export class AppS3Service {
    public readonly S3Config: S3ConfigInterface;
    private readonly s3Client: S3;
    private readonly logger = new Logger(AppS3Service.name);

    constructor(private readonly configService: ConfigService) {
        this.S3Config = this.configService.get("aws_s3");
        this.s3Client = this.getS3Client();
    }

    public get privateBucketName(): string {
        return this.S3Config.private_bucket_name;
    }

    getS3Client() {
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
        this.logger.debug(`Uploading file ${name} to bucket ${bucket}`);
        const params = {
            Bucket: bucket,
            Key: name,
            Body: file,
            ContentType: mimeType
        };
        return new Promise((resolve, reject) => {
            this.s3Client.upload(params, (err, data) => {
                if (err) {
                    this.logger.error(`Error uploading file: ${err.message}`, err.stack);
                    reject(new Error(err.message));
                }
                this.logger.debug(`File uploaded successfully: ${data.Location}`);
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
        this.logger.debug(`Deleting file ${key} from bucket ${bucketName}`);
        const params = {
            Bucket: bucketName,
            Key: key
        };
        this.s3Client.deleteObject(params, (err) => {
            if (err) this.logger.error(`Error deleting file: ${err.message}`, err.stack);
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
        this.logger.debug(`Generating presigned URL for ${key} in bucket ${bucketName}`);
        const params = {
            Bucket: bucketName,
            Key: key,
            Expires: expires
        };
        if (contentType != null) {
            params["ResponseContentDisposition"] = `${contentType}; filename="${key}"`;
        }
        return this.s3Client.getSignedUrlPromise("getObject", params);
    }

}
