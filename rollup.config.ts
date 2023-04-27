import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";

const commonPlugins = [typescript(), nodeResolve(), json()];

export default defineConfig([
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/index.js",
      format: "es",
    },
    plugins: commonPlugins,
  },
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/index.d.ts",
      format: "es",
    },
    plugins: commonPlugins.concat(dts()),
  },
]);
