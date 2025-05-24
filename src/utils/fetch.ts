import packageJson from "@package"
import ky from "ky"

export const fetch = ky.extend({
  throwHttpErrors: false,
  headers: {
    "User-Agent": `BeatSnipe v${packageJson}`,
  },
})
