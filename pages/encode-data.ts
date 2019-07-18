// encoding paths
import { PathToRank, RequiredPathOptions } from './types'
import LZString from 'lz-string'
import { encode as encode64, decode as decode64 } from './safe64'

const OPTIONS_DELIMITER = ' '

function encodePathOptions(applyOptions: boolean, options: RequiredPathOptions): string {
  // transform option to binary then to hex string
  return parseInt(`${+applyOptions}${+options.strict}${+options.sensitive}`, 2).toString(16)
}

function decodePathOptions(options: string): { applyOptions: boolean, options: PathToRank['options'] } {
  // transform the hex value into an array of the bits as true/false values
  const values = parseInt(options, 16).toString(2).split('').map(v => v === '1')
  return {
    applyOptions: values[0],
    options: {
      strict: values[1],
      sensitive: values[2],
    }
  }
}

function encodePaths(paths: PathToRank[]): string {
  let str = ''
  for (const path of paths) {
    str += encodePathOptions(path.applyOptions, path.options) + OPTIONS_DELIMITER + path.path + '\n'
  }

  return str
}

function decodePaths(encodedPaths: string): PathToRank[] {
  return encodedPaths.split('\n').map(
    encodedPath => {
      const optionsEnd = encodedPath.indexOf(OPTIONS_DELIMITER)
      const { applyOptions, options } = decodePathOptions(encodedPath.slice(0, optionsEnd))

      return {
        path: encodedPath.slice(optionsEnd + 1),
        applyOptions,
        options,
      }
    }
  )
}

export function compressPaths(paths: PathToRank[]): string {
  return encode64(LZString.compress(encodePaths(paths.filter(p => p.path))))
}

export function decompressPaths(paths: string): PathToRank[] {
  return decodePaths(LZString.decompress(decode64(paths)))
}
