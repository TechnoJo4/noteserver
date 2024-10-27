export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: Lowercase<string>]: any;
    }
  }
}
