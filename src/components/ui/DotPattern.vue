<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '../../lib/utils'

interface DotPatternProps {
  width?: number | string
  height?: number | string
  x?: number | string
  y?: number | string
  cx?: number | string
  cy?: number | string
  cr?: number | string
  className?: string
}

const props = withDefaults(defineProps<DotPatternProps>(), {
  width: 24,
  height: 24,
  x: 0,
  y: 0,
  cx: 1,
  cy: 0.5,
  cr: 0.5,
  className: ''
})

const id = useId()
</script>

<template>
  <svg
    aria-hidden="true"
    :class="cn('pointer-events-none absolute inset-0 h-full w-full fill-slate-500/40', props.className)"
  >
    <defs>
      <pattern
        :id="id"
        :width="props.width"
        :height="props.height"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
        :x="props.x"
        :y="props.y"
      >
        <circle id="pattern-circle" :cx="props.cx" :cy="props.cy" :r="props.cr" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" stroke-width="0" :fill="`url(#${id})`" />
  </svg>
</template>
