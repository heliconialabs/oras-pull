# Notes

## Authentication

https://blog.atomist.com/github-container-registry/

curl -u username:<personal-access-token> https://ghcr.io/token?service=ghcr.io&scope=repository:<repo>:pull&client_id=oras-pull

## Operations

curl -H 'Accept: application/vnd.oci.image.manifest.v1+json' -H 'Authorization: Bearer QQ==' https://ghcr.io/v2/larshp/oras-test/oras-test/manifests/latest

curl -v -L -H 'Authorization: Bearer QQ==' --output foo.tar https://ghcr.io/v2/larshp/oras-test/oras-test/blobs/sha256:7d1aa8a6b70b8d85769c3e094d767f3c2e308d5fe34a418e70329123d475c594