const {Storage} = require('@google-cloud/storage');

const bucketName = 'lba2remake';
const filename = process.argv[2];
const targetFilename = process.argv[3];

if (!process.env.GCS_SERVICE_ACCOUNT) {
    throw new Error('You need to define a GCS_SERVICE_ACCOUNT to upload files');
}

const serviceAccount = JSON.parse(process.env.GCS_SERVICE_ACCOUNT);

const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
    }
});

async function uploadFile() {
  await storage.bucket(bucketName).upload(filename, {
    destination: targetFilename,
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  console.log(`${targetFilename} uploaded to ${bucketName}.`);
}

uploadFile().catch(console.error);