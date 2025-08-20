<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        :variant="outlineOrSecondary()"
        size="icon"
        class="absolute bottom-28 left-0 flex size-12 rounded-full sm:bottom-40 sm:left-8"
      >
        <VisSingleContainer :data="voteResult" class="size-full" v-if="hasNonNeutral">
          <VisDonut
            :value="(d: number) => d"
            :centralLabel="truePercentage"
            :color="(d: number, i: number) => ['#00bc7d', '#fb2c36'][i]"
            :arcWidth="4"
            :radius="20"
            :padAngle="0.1"
            :cornerRadius="64"
          />
        </VisSingleContainer>
        <Icon v-else name="lucide:vote" class="text-xl" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-fit" side="right" align="start" :side-offset="16">
      <DropdownMenuLabel class="font-semibold">Donnez votre avis</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup v-model="internalValue">
        <DropdownMenuRadioItem
          value="correct"
          :class="internalValue === 'correct' ? 'bg-green-50' : ''"
          class="cursor-pointer focus:bg-green-50"
        >
          <template #indicator>
            <Icon name="lucide:circle-check" class="size-4 text-green-600 mt-1" />
          </template>
          Correct
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          value="incorrect"
          :class="internalValue === 'incorrect' ? 'bg-red-50' : ''"
          class="cursor-pointer focus:bg-red-50"
        >
          <template #indicator>
            <Icon name="lucide:circle-x" class="size-4 text-red-600 mt-1" />
          </template>
          Incorrect
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          value="neutral"
          :class="internalValue === 'neutral' ? 'bg-accent' : ''"
          class="cursor-pointer"
        >
          <template #indicator>
            <Icon name="lucide:circle-dot-dashed" class="size-4 text-current mt-1" />
          </template>
          Ne se prononce pas
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { VisSingleContainer, VisDonut } from "@unovis/vue";

// Types locaux
export type VoteValue = "correct" | "incorrect" | "neutral";

const props = defineProps<{
  modelValue: VoteValue;
  votes: { playerId: string; value: VoteValue }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: VoteValue): void;
}>();

const { outlineOrSecondary } = useDarkMode();

const internalValue = computed<VoteValue>({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const hasNonNeutral = computed(() =>
  (props.votes || []).filter((v) => v.value !== "neutral").length > 0
);

const voteResult = computed(() => [
  (props.votes || []).filter((vote) => vote.value === "correct").length,
  (props.votes || []).filter((vote) => vote.value === "incorrect").length,
]);

const truePercentage = computed(() => {
  const correct = (props.votes || []).filter((v) => v.value === "correct").length;
  const incorrect = (props.votes || []).filter((v) => v.value === "incorrect").length;
  const totalNonNeutral = correct + incorrect;
  if (totalNonNeutral === 0) return "0%";
  return `${Math.round((correct / totalNonNeutral) * 100)}%`;
});
</script>
