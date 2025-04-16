import { breakpointsTailwind } from "@vueuse/core"

export const useScreenSize = () => {
	return useBreakpoints(breakpointsTailwind)
}
