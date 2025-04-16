// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		"@nuxtjs/tailwindcss",
		"shadcn-nuxt",
		"radix-vue/nuxt",
		"@nuxtjs/color-mode",
		"@nuxt/eslint",
		"@nuxt/icon",
		"@pinia/nuxt",
		"pinia-plugin-persistedstate/nuxt",
		"@nuxt/image",
		"@nuxt/content",
		"@nuxtjs/supabase",
		"motion-v/nuxt",
		"@vueuse/nuxt",
	],

	ssr: false,
	devtools: {
		enabled: true,
	},

	colorMode: {
		classSuffix: "",
	},

	content: {
		renderer: {
			anchorLinks: false,
		},
	},

	runtimeConfig: {
		public: {
			openQuizzDbApiKey: process.env.NUXT_PUBLIC_OPEN_QUIZZ_DB_API_KEY,
			openQuizzDbApiUrl: process.env.NUXT_PUBLIC_OPEN_QUIZZ_DB_API_URL,
		},
	},

	compatibilityDate: "2024-11-01",

	typescript: {
		typeCheck: true,
	},

	eslint: {
		config: {
			stylistic: {
				semi: false,
				indent: "tab",
				quotes: "double",
			},
		},
	},

	shadcn: {
		/**
								* Prefix for all the imported component
								*/
		prefix: "",
		/**
								* Directory that the component lives in.
								* @default "./components/ui"
								*/
		componentDir: "./components/ui",
	},

	supabase: {
		redirect: true,
		redirectOptions: {
			login: "/register",
			callback: "/",
			exclude: ["/login", "/register"],
		},
	},
})
