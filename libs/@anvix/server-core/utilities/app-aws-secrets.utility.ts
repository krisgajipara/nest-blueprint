import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export async function preloadSecrets() {
    const region = process.env.AWS_REGION || "us-east-1";
    const secretId = process.env.AWS_SECRET_ID;

    if (!secretId) {
        console.warn("AWS_SECRET_ID not provided, skipping secrets preload");
        return;
    }

    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await client.send(command);

    if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);

        for (const [key, value] of Object.entries(secrets)) {
            process.env[key] = value as string;
        }

        console.log("AWS secrets preloaded into process.env");
    }
}
