export interface IDisposable {
  dispose: () => void|Promise<void>;
}
