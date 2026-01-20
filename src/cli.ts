import process from 'node:process';
import stream from 'node:stream';
import fetch from 'cross-fetch';
import * as tar from 'tar';

async function oauth(repo: string) {
  const token = process.env.GITHUB_TOKEN;

  if (token === undefined || token.startsWith("gh") === false) {
    return "QQ==";
  }

  console.log("Token: \t" + repo);

  const tokenResponse = await fetch(`https://ghcr.io/token?service=ghcr.io&scope=repository:${repo}:pull&client_id=npm-js-oras-pull`, {
    headers: {
      authorization: "Basic " + Buffer.from("foo:" + process.env.GITHUB_TOKEN).toString("base64"),
    }
  });
  if (tokenResponse.status !== 200) {
    console.dir(await tokenResponse.json());
    process.exit(1);
  }
  return (await tokenResponse.json()).token;
}

async function run() {
  const imageName = process.argv[2];

  if (imageName === undefined) {
    console.log("Supply argument");
    process.exit(1);
  }

  console.log("Pull: \t" + imageName);

  let [url, tag] = imageName.split(":");

  const repo = url.replace("ghcr.io/", "").split("/").splice(0, 2).join("/");
  const bearer = await oauth(repo);

  url = url.replace("ghcr.io", "https://ghcr.io/v2");

  const manifestResponse = await fetch(url + '/manifests/' + tag, {
    headers: {
      accept: "application/vnd.oci.image.manifest.v1+json",
      authorization: "Bearer " + bearer
    }
  });
  if (manifestResponse.status !== 200) {
    console.dir(await manifestResponse.json());
    process.exit(1);
  }

  const manifest = await manifestResponse.json();
  const layer = manifest.layers[0];
  console.log("Digest: " + layer.digest);
  console.log("Size: \t" + layer.size + " bytes");

  const blobResponse = await fetch(url + '/blobs/' + layer.digest, {
    headers: {
      authorization: "Bearer " + bearer
    }
  });
  if (blobResponse.status !== 200) {
    console.dir(await manifestResponse.json());
    process.exit(1);
  }

  const responseBuffer = Buffer.from(await blobResponse.arrayBuffer());
  const readableStream = stream.Readable.from(responseBuffer);

  console.log("");
  let count = 0;
  const st = readableStream.pipe(
    tar.extract({
      onentry: entry => {
        count++;
        if (count < 10) {
          console.log("Extract: " + entry.path);
        } else if (count % 100 === 0) {
          console.log(count);
        }
      }
    })
  );
  st.on('finish', () => {
    console.log(count + " folders/files extracted");
  });

}

run().then(() => {
//  process.exit();
}).catch((err) => {
  console.log(err);
  process.exit(1);
});