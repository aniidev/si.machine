export default {
  type: "cli",
  kind: "output",
  create() {
    return {
      async render(result) {
        console.log("");
        console.log(result.text);
      }
    };
  }
};
