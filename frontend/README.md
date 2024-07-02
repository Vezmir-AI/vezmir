# Infos

A quick template with all the basics needed to jumpstart a new project ⚡

# What's in the box 🎁

- Nuxt 3.x (latest)
- TailwindCSS 3 (with PostCSS)
- A default page & layout
- Global style sheet
- Some _maybe_ useful components

# Process

## Creating a new Page

Create a new **_Vue_** file in `/pages` folder. The name of the file is also use for its path. For example, `/pages/foo/bar.vue` will be resolved as `www.website.com/foo/bar.html`
<br>
💡 _More info here : [nuxt.com/docs/getting-started/views#pages](https://nuxt.com/docs/getting-started/views#pages)_

## Using Components

Calling a component should be done as follows:
<br>
`/components/utils/FancyButton.vue` should be called with `<utils-fancy-button></utils-fancy-button>`
<br>
💡 _More info here : [nuxt.com/docs/getting-started/views#components](https://nuxt.com/docs/getting-started/views#components)_

## Style

### Global Style Sheet

The global style sheet is a **_postcss_** file in `/assets/css/base.postcss`
<br>
You can write and use basic _CSS_ but prefer using `@apply` with _Tailwind_ properties.
<br>
💡 _All Tailwind properties here : [tailwindcss.com/docs](https://tailwindcss.com/docs)_

### Component Style

In-component style should be written using PostCSS and `@apply` to re-use _Tailwind_ property as much as possible (also know as _Atomic CSS_).
<br>
Inside your component use the `style` tag as follows:

```html
<style lang="postcss" scoped>
  .button-red {
    @apply h-8 w-8;
    @apply bg-red-200 rounded;
  }
</style>
```

📝 Note: `scoped` means your style won't leak into other components. Very usefull for _Layouts_ components.
<br>
💡 _More info here : [vue-loader.vuejs.org/guide/scoped-css.html](https://vue-loader.vuejs.org/guide/scoped-css.html)_

### Custom Tailwind Config

You can override or add new properties for _Tailwind_ inside its config file `/tailwind.config.js`

- To override properties, you can use this as an example: _[tailwindcss.com/docs/customizing-spacing#overriding-the-default-spacing-scale](https://tailwindcss.com/docs/customizing-spacing#overriding-the-default-spacing-scale)_
- To add (or extend) new properties you can use this example: _[https://tailwindcss.com/docs/customizing-colors#extending-the-defaults](https://tailwindcss.com/docs/customizing-colors#extending-the-defaults)_ Pay attention to the `extends:` property at the beginning.

## Layouts

💨 _[nuxt.com/docs/getting-started/views#layouts](https://nuxt.com/docs/getting-started/views#layouts)_

## Static vs Assets

To make things simple. Assets inside the `/assets` folder will be proccesed by some webpack module, like `base.postcss` for example. It can be images, JSON files,... Outputted files will have hashed name to facilitate cache management.
<br>
On the opposite side, `/static` files will be served _as it is_ with no hash or handling whatsoever.

## Tailwind Autocomplete

💨 _[https://tailwindcss.nuxtjs.org/tailwind/editor-support/](https://tailwindcss.nuxtjs.org/tailwind/editor-support/)_

## Building

```bash
# install dependencies
$ yarn install

# run dev server (w/ hot reloead)
$ yarn run dev

# build for production
$ yarn run generate
```
