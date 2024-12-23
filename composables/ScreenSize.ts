import { breakpointsTailwind, useBreakpoints } from "@vueuse/core"

export const useScreenSize = () => {
	return useBreakpoints(breakpointsTailwind)
}
