<script setup lang="ts">
import { useStrategyProposals } from "@pwndao/sdk-v1-vue";

const props = defineProps<{
	strategyId: string;
}>();

const { data: proposals, isLoading } = useStrategyProposals(props.strategyId);
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Proposals List</h1>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-pulse text-gray-500">Loading proposals...</div>
    </div>
    
    <div v-else-if="proposals?.length" class="space-y-4">
      <div 
        v-for="proposal in proposals" 
        :key="proposal.hash"
        class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-gray-50"
      >
        <h2 class="text-lg font-semibold text-gray-700 truncate">{{ proposal.hash }}</h2>
        <p class="mt-2 text-sm text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded">{{ proposal.type }}</p>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-500">
      No proposals found for this strategy.
    </div>
  </div>
</template>
