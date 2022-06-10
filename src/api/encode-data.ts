// encoding paths
import LZString from 'lz-string'
import { encode as encode64, decode as decode64 } from './safe64'
import { PathOptions, PathToRank } from '../types/matcher'

const OPTIONS_DELIMITER = ' '

const enum OPTION_FLAGS {
  applyOptions = 1 << 2,
  strict = 1 << 1,
  sensitive = 1 << 0,
}

function encodePathOptions(
  applyOptions: boolean,
  options: PathOptions
): string {
  // transform option to bits then to hex string
  return parseInt(
    `${+!!applyOptions}${+!!options.strict}${+!!options.sensitive}`,
    2
  ).toString(16)
}

function decodePathOptions(options: string): {
  applyOptions: boolean
  options: PathOptions
} {
  // transform the hex value into an array of the bits as true/false values
  const flags = parseInt(options, 16)
  return {
    applyOptions: !!(flags & OPTION_FLAGS.applyOptions),
    options: {
      strict: !!(flags & OPTION_FLAGS.strict),
      sensitive: !!(flags & OPTION_FLAGS.sensitive),
    },
  }
}

function encodePathsAndOptions(
  paths: PathToRank[],
  options: PathOptions
): string {
  let str = encodePathOptions(false, options) + OPTIONS_DELIMITER

  for (const path of paths) {
    str +=
      encodePathOptions(path.applyOptions, path) +
      OPTIONS_DELIMITER +
      path.path +
      '\n'
  }

  return str
}

function decodePathsAndOptions(encodedPathsAndOptions: string): {
  paths: PathToRank[]
  options: PathOptions
} {
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
  options: PathOptions
): string {
  return encode64(
    LZString.compress(
      encodePathsAndOptions(
        paths.filter((p) => p.path),
        options
      )
    )
  )
}

export function decompressPaths(paths: string): {
  paths: PathToRank[]
  options: PathOptions
} {
  return decodePathsAndOptions(LZString.decompress(decode64(paths)))
}
