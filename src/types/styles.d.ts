// Los imports CSS de Expo Web también deben resolver en checkouts limpios de CI.
declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}
