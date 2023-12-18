import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    output: "cjs"
  },
  esm: {
    output: "esm"
  }
});