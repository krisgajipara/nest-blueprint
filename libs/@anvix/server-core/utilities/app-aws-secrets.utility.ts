import { SecretsManager } from "aws-sdk";

export async function preloadSecrets() {
    const region = process.env.AWS_REGION || "us-east-1";
    const secretId = process.env.AWS_SECRET_ID;

    if (!secretId) {
        console.warn("AWS_SECRET_ID not provided, skipping secrets preload");
        return;
    }

    const client = new SecretsManager({ region });
    const response = await client.getSecretValue({ SecretId: secretId }).promise();

    if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);

        for (const [key, value] of Object.entries(secrets)) {
            process.env[key] = value as string;
        }

        console.log("AWS secrets preloaded into process.env");
    }
}
