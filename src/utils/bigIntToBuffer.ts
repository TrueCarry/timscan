export function bigIntToBuffer(data: bigint | undefined) {
  if (!data) {
    return Buffer.from([])
  }
  const hexStr = data.toString(16)
  const pad = hexStr.padStart(64)
  const hashHex = Buffer.from(pad, 'hex')

  return hashHex
}
