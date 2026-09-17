<template>
  <div class="mb-7 sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="text-foreground mb-3 text-3xl leading-9 font-bold tracking-tight lg:text-4xl">
      <slot />
    </h2>

    <p class="text-muted-foreground text-sm leading-6">
      <slot name="desc" />
    </p>
  </div>
</template>
