import process from 'node:process';
import stream from 'node:stream';
import fetch from 'cross-fetch';
import tar from 'tar';

async function run() {
  const imageName = process.argv[2];

  if (imageName === undefined) {
    console.log("Supply argument");
    process.exit(1);
  }

  console.log("Pull: \t" + imageName);

  let [url, tag] = imageName.split(":");
  url = url.replace("ghcr.io", "https://ghcr.io/v2");

  const manifestResponse = await fetch(url + '/manifests/' + tag, {
    headers: {
      accept: "application/vnd.oci.image.manifest.v1+json",
      authorization: "Bearer QQ=="
    }
  });
  const manifest = await manifestResponse.json();
  const layer = manifest.layers[0];
  console.log("Digest: " + layer.digest);
  console.log("Size: \t" + layer.size + " bytes");

  const blobResponse = await fetch(url + '/blobs/' + layer.digest, {
    headers: {
      authorization: "Bearer QQ=="
    }
  });

  const responseBuffer = Buffer.from(await blobResponse.arrayBuffer());
  const readableStream = stream.Readable.from(responseBuffer);

  console.log("");
  readableStream.pipe(
    tar.extract({
      onentry: entry => { console.log("Extract: " + entry.path); }
    })
  );
}

run().then(() => {
//  process.exit();
}).catch((err) => {
  console.log(err);
  process.exit(1);
});

/*
Testing notes,

curl -H 'Accept: application/vnd.oci.image.manifest.v1+json' -H 'Authorization: Bearer QQ==' https://ghcr.io/v2/larshp/oras-test/oras-test/manifests/latest

curl -v -L -H 'Authorization: Bearer QQ==' --output foo.tar https://ghcr.io/v2/larshp/oras-test/oras-test/blobs/sha256:7d1aa8a6b70b8d85769c3e094d767f3c2e308d5fe34a418e70329123d475c594
*/