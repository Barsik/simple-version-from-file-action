import * as core from '@actions/core'
import * as exec from '@actions/exec'

const getPrevVersion = async (filePath: string, fileContentRegex: string) => {
  let grepOutput = ''
  await exec.exec(
    `git show HEAD~1:${filePath} | grep '${fileContentRegex}'`,
    [],
    {
      listeners: {
        stdout: data => {
          grepOutput += data.toString()
        }
      }
    }
  )

  return grepOutput
}

async function run(): Promise<void> {
  try {
    core.info(
      'Works only with "actions/checkout" and "fetch-depth" should be 0 to fetch all history'
    )

    const filePath: string = core.getInput('file-path')
    const fileContentRegex: string = core.getInput('file-content-regex')

    const currentVersionResult: exec.ExecOutput = await exec.getExecOutput(
      'grep',
      [fileContentRegex, filePath]
    )

    const currentVersion: string =
      currentVersionResult.exitCode === 0 ? currentVersionResult.stdout : ''

    core.setOutput('version', currentVersion)

    const prevVersion: string = await getPrevVersion(filePath, fileContentRegex)
    core.setOutput('prev-version', prevVersion)

    core.setOutput('chnaged', prevVersion === currentVersion)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
