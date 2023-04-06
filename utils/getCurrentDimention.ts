function getCurrentDimension() {
  return {
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  };
}
export default getCurrentDimension;
