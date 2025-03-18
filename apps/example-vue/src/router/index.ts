import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import StrategiesView from "../views/StrategiesView.vue";
import StrategyView from "../views/StrategyView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/strategies",
			name: "strategies",
			component: StrategiesView,
		},
		{
			path: "/strategy/:id",
			name: "strategy",
			component: StrategyView,
		},
	],
});

export default router;
