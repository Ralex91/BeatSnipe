const wait = (s: number) => new Promise((res) => void setTimeout(res, s * 1000))

export default wait
