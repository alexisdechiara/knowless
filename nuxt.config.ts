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
		"@formkit/auto-animate/nuxt",
		"@nuxtjs/device",
		"@nuxtjs/seo",
		"@nuxtjs/plausible",
	],

	components: [
		{
			path: "~/components",
			pathPrefix: false,
		},
	],

	devtools: {
		enabled: true,
	},

	app: {
		head: {
			meta: [
				{ name: "google-site-verification", content: process.env.GOOGLE_SITE_VERIFICATION },
			],
		},
	},

	colorMode: {
		classSuffix: "",
	},

	content: {
		renderer: {
			anchorLinks: false,
		},
	},

	routeRules: {
		"/**": {
			ogImage: {
				component: "Default",
			},
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

	icon: {
		customCollections: [
			{
				prefix: "custom",
				dir: "./assets/icons",
			},
		],
	},

	ogImage: {
		debug: true,
	},

	robots: {
		disallow: ["/test"],
		sitemap: "https://knowless.vercel.app/sitemap.xml",
	},

	seo: {
		meta: {
			themeColor: [
				{ content: "#020817", media: "(prefers-color-scheme: dark)" },
				{ content: "white", media: "(prefers-color-scheme: light)" },
			],
			author: "Alexis De Chiara",
			colorScheme: "dark light",
			ogLocale: "fr_FR",
		},
	},

	shadcn: {
		prefix: "",
		componentDir: "./components/ui",
	},

	supabase: {
		redirect: true,
		redirectOptions: {
			login: "/register",
			callback: "/",
			exclude: ["/login", "/register", "/forgot-password", "/reset-password", "/terms", "/privacy", "/legal-notice"],
		},
	},
})
