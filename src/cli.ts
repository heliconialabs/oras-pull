import process from 'node:process';
import stream from 'node:stream';
import fetch from 'cross-fetch';
import tar from 'tar';

async function run() {
  const imageName = process.argv[2];

  if (imageName === undefined) {
    console.log("Supply argument");
    process.exit(11);
  }

  console.log("Pull: \t" + imageName);

  const manifestResponse = await fetch('https://ghcr.io/v2/larshp/oras-test/oras-test/manifests/latest', {
    headers: {
      accept: "application/vnd.oci.image.manifest.v1+json",
      authorization: "Bearer QQ=="
    }
  });
  const manifest = await manifestResponse.json();
  const layer = manifest.layers[0];
  console.log("Digest: " + layer.digest);
  console.log("Size: \t" + layer.size + " bytes");

  const blobResponse = await fetch('https://ghcr.io/v2/larshp/oras-test/oras-test/blobs/sha256:7d1aa8a6b70b8d85769c3e094d767f3c2e308d5fe34a418e70329123d475c594', {
    headers: {
      authorization: "Bearer QQ=="
    }
  });

  const buf = Buffer.from(await blobResponse.arrayBuffer());
  const st = stream.Readable.from(buf);

  console.log("");
  st.pipe(
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