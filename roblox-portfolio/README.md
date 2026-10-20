# React + TypeScript + Vite

## Adding portfolio pictures

Pictures are defined directly in [`src/App.tsx`](./src/App.tsx), in the
`INITIAL_MODELS` array. Put the image in `public/imgs`, then add an object
with its path, title, category, and order:

```ts
{
  title: "My new model",
  category: "Weapons",
  imageUrl: "/imgs/my-model.png",
  order: 5,
  createdAt: Date.now(),
},
```

After saving the file, run `npm run build` and deploy the site. There is no
admin login or password system; editing the source code is the only way to
change the gallery.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
