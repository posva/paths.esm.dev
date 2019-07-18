// encoding paths
import { PathToRank, RequiredPathOptions } from './types'
import LZString from 'lz-string'
import { encode as encode64, decode as decode64 } from './safe64'

const OPTIONS_DELIMITER = ' '

function encodePathOptions(
  applyOptions: boolean,
  options: RequiredPathOptions
): string {
  // transform option to binary then to hex string
  return parseInt(
    `${+applyOptions}${+options.strict}${+options.sensitive}`,
    2
  ).toString(16)
}

function decodePathOptions(
  options: string
): { applyOptions: boolean; options: PathToRank['options'] } {
  // transform the hex value into an array of the bits as true/false values
  const values = parseInt(options, 16)
    .toString(2)
    .split('')
    .map((v) => v === '1')
  return {
    applyOptions: values[0],
    options: {
      strict: !!values[1],
      sensitive: !!values[2],
    },
  }
}

function encodePathsAndOptions(
  paths: PathToRank[],
  options: RequiredPathOptions
): string {
  let str = encodePathOptions(false, options) + OPTIONS_DELIMITER

  for (const path of paths) {
    str +=
      encodePathOptions(path.applyOptions, path.options) +
      OPTIONS_DELIMITER +
      path.path +
      '\n'
  }

  return str
}

function decodePathsAndOptions(
  encodedPathsAndOptions: string
): { paths: PathToRank[]; options: RequiredPathOptions } {
  // debugger
  const globalOptionsEnd = encodedPathsAndOptions.indexOf(OPTIONS_DELIMITER)
  const { options } = decodePathOptions(
    encodedPathsAndOptions.slice(0, globalOptionsEnd)
  )

  const encodedPaths = encodedPathsAndOptions.slice(globalOptionsEnd + 1)

  const paths = encodedPaths.split('\n').map((encodedPath) => {
    const optionsEnd = encodedPath.indexOf(OPTIONS_DELIMITER)
    const { applyOptions, options } = decodePathOptions(
      encodedPath.slice(0, optionsEnd)
    )

    return {
      path: encodedPath.slice(optionsEnd + 1),
      applyOptions,
      options,
    }
  })

  return { paths, options }
}

export function compressPaths(
  paths: PathToRank[],
  options: RequiredPathOptions
): string {
  return encode64(
    LZString.compress(
      encodePathsAndOptions(paths.filter((p) => p.path), options)
    )
  )
}

export function decompressPaths(
  paths: string
): { paths: PathToRank[]; options: RequiredPathOptions } {
  return decodePathsAndOptions(LZString.decompress(decode64(paths)))
}
