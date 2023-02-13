export function toBase64Url(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_')
}

export function bufferToBase64Url(buffer: Buffer) {
  return toBase64Url(buffer.toString('base64'))
}
