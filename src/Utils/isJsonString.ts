
export default function (str: string) {
    try {
        JSON.parse(str)
    } catch (e) {
        return
    }
    return true
}