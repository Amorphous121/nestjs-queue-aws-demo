import stream from 'stream';
import { S3 } from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { readFile, writeFile } from 'fs/promises';
import { getLocalFileStoreLocation } from 'src/utils/file.util';

export const initializeS3 = (function () {
  let s3: S3;
  return () => {
    if (!s3) {
      s3 = new S3({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY,
        },
        region: process.env.AWS_REGION,
      });
    }
    return s3;
  };
})();

export const initializeS3Client = (function () {
  let s3;
  return () => {
    if (!s3) {
      s3 = new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY,
        },
        region: process.env.AWS_REGION,
      });
    }
    return s3;
  };
})();

export const uploadFromStream = (s3, fileName: string) => {
  const pass = new stream.PassThrough();

  s3.upload(
    {
      Body: pass,
      Key: fileName,
      ACL: process.env.AWS_BUCKET_ACL,
      Bucket: process.env.AWS_BUCKET_NAME,
    },
    (err: Error, data: Record<string, any>) => {
      if (!err) console.log(data);
      else console.log(err);
    },
  );

  return pass;
};

export const storeInputFile = async (path: string) => {
  const inputFileLocation = getLocalFileStoreLocation(
    path.split('/')[1],
    'input',
  );
  const s3 = initializeS3();

  const fileContent = await new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path,
      },
      (err, data) => {
        if (err) return reject(err);
        return resolve(data.Body);
      },
    );
  });

  await writeFile(inputFileLocation, fileContent as string);
  return inputFileLocation;
};

export const storeOutputFile = async (
  outputFileName: string,
  location: string,
) => {
  const s3 = initializeS3();

  const fileContent = await readFile(location);

  await new Promise(async (resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: outputFileName,
        Body: fileContent,
      },
      (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      },
    );
  });
};
