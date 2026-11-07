/*
 * Where the desktop app downloads live: the latest GitHub Release, which the
 * desktop-release workflow fills with these exact file names (artifactName
 * in apps/desktop/electron-builder.yml). Change both together.
 */
const LATEST = 'https://github.com/rahulsainlll/kian/releases/latest'

export const DOWNLOADS = {
  macArm: `${LATEST}/download/Kian-mac-arm64.dmg`,
  macIntel: `${LATEST}/download/Kian-mac-x64.dmg`,
  windows: `${LATEST}/download/Kian-Setup-x64.exe`,
  all: LATEST,
}
