// Quick script to generate valid 192x192 and 512x512 PNGs for PWA manifest
import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // Scanlines: width * 3 bytes + 1 filter byte per line
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // No filter
    for (let x = 0; x < width; x++) {
      // Border or center gradient pattern
      const isBorder = (x < 10 || x > width - 10 || y < 10 || y > height - 10);
      if (isBorder) {
        rawData[offset++] = 56;  // Cyan #38D9E6
        rawData[offset++] = 217;
        rawData[offset++] = 230;
      } else {
        rawData[offset++] = r;   // Dark blue #0B1020
        rawData[offset++] = g;
        rawData[offset++] = b;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// Standard CRC32
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

fs.writeFileSync('public/icon-192.png', createPNG(192, 192, 11, 16, 32));
fs.writeFileSync('public/icon-512.png', createPNG(512, 512, 11, 16, 32));
console.log('PWA PNG icons generated successfully!');
