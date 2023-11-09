find ./src \( -name "*.vert" -o -name "*.frag" \) -type f -exec bash -c 'mkdir -p "src/generated/$(dirname "{}")" && cp "{}" "src/generated/$(dirname "{}")/$(basename $(basename "{}" .vert) .frag).txt"' \;

bun run bundle
