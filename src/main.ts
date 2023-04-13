import * as core from '@actions/core'
import * as exec from '@actions/exec'

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

    if (currentVersionResult.exitCode != 0) {
      throw currentVersionResult.exitCode
    }

    const currentVersion: string = currentVersionResult.stdout
    core.setOutput('version', currentVersion)

    const prevVersionResult: exec.ExecOutput = await exec.getExecOutput(
      `git show HEAD~1:${filePath} | grep '${fileContentRegex}'`,
      []
    )
    if (prevVersionResult.exitCode != 0) {
      throw prevVersionResult.exitCode
    }

    const prevVersion: string = prevVersionResult.stdout
    core.setOutput('prev-version', prevVersion)

    core.setOutput('chnaged', prevVersion === currentVersion)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
