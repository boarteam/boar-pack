export default function safetyRun<T>(promise?: Promise<T>): void {
  promise?.catch((e) => {
    console.error(e);
  })
}
