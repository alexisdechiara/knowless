import { z } from "zod"
import { useForm, type GenericObject } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

export const useRegisterForm = (randomTagNumber: string, getAvatarUrl: string) => {
	// Étape 1 - Profil
	const profileSchema = z.object({
		username: z.string().min(2, "Le pseudo doit comporter au moins 2 caractères").max(50).nonempty(),
		usertag: z.string().min(0).default(randomTagNumber),
		avatar: z.string().nullable(),
		language: z.enum(["en", "fr", "es", "it", "de", "nl"]).default("fr"),
	})

	// Étape 2 - Compte
	const accountFields = z.object({
		email: z.string().email(),
		password: z.string().min(6).max(50),
		confirmPassword: z.string(),
	})

	// Fusion et validation finale
	const schema = profileSchema.merge(accountFields).superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				path: ["confirmPassword"],
				message: "Les mots de passe doivent correspondre !",
				code: z.ZodIssueCode.custom,
			})
		}
	})

	const { handleSubmit, validate, validateField, setErrors, setFieldValue, values, meta, isFieldValid } = useForm<GenericObject>({
		validationSchema: toTypedSchema(schema),
		initialValues: {
			username: "",
			usertag: randomTagNumber,
			avatar: getAvatarUrl,
			language: "fr",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const formatZodErrors = (zodError: z.ZodError): Record<string, string> => {
		const fieldErrors: Record<string, string> = {}
		for (const [key, messages] of Object.entries(zodError.flatten().fieldErrors)) {
			if (messages?.length) {
				fieldErrors[key] = messages[0] as string
			}
		}
		return fieldErrors
	}

	const validateProfileStep = async () => {
		const result = profileSchema.safeParse(values)
		if (result.success) return true
		setErrors(formatZodErrors(result.error))
		return false
	}

	const validateAccountStep = async () => {
		const result = accountFields.safeParse(values)
		const fieldErrors: Record<string, string> = result.success
			? {}
			: formatZodErrors(result.error)

		if (values.password !== values.confirmPassword) {
			fieldErrors.confirmPassword = "Les mots de passe doivent correspondre !"
		}

		if (Object.keys(fieldErrors).length > 0) {
			setErrors(fieldErrors)
			return false
		}

		return true
	}

	return {
		handleSubmit,
		validate,
		validateField,
		setFieldValue,
		values,
		meta,
		validateProfileStep,
		validateAccountStep,
		isFieldValid,
	}
}
/* ZOD 4

import { z } from "zod/v4"
import { useForm, type GenericObject } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

export const useRegisterForm = (randomTagNumber: string, getAvatarUrl: string) => {
  // Étape 1 - Profil
  const profileSchema = z.object({
    username: z.string().min(2, "Le pseudo doit comporter au moins 2 caractères").max(50),
    usertag: z.string().min(0).default(randomTagNumber),
    avatar: z.string().nullable(),
    language: z.enum(["en", "fr", "es", "it", "de", "nl"]).default("fr"),
  })

  // Étape 2 - Compte
  const accountFields = z.object({
    email: z.email(),
    password: z.string().min(6).max(50),
    confirmPassword: z.string(),
  })

  // Fusion et validation finale
	const schema = z.object({ ...profileSchema.shape, ...accountFields.shape,})
	.refine(data => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Les mots de passe doivent correspondre !",
	})

  const { handleSubmit, validate, validateField, setErrors, setFieldValue, values, meta, isFieldValid } = useForm<GenericObject>({
    validationSchema: toTypedSchema(schema),
    initialValues: {
      username: "",
      usertag: randomTagNumber,
      avatar: getAvatarUrl,
      language: "fr",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const formatZodErrors = (zodError: z.ZodError): Record<string, string> => {
    const fieldErrors: Record<string, string> = {}
    
    // Traiter les issues directement - plus simple et plus fiable
    for (const issue of zodError.issues) {
      const fieldName = issue.path.length > 0 ? issue.path[0] : 'root'
      if (typeof fieldName === 'string' && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message
      }
    }
   
    return fieldErrors
  }

  const validateProfileStep = async () => {
    const result = profileSchema.safeParse(values)
    if (result.success) return true
    setErrors(formatZodErrors(result.error))
    return false
  }

  const validateAccountStep = async () => {
    const result = accountFields.safeParse(values)
    const fieldErrors: Record<string, string> = result.success
      ? {}
      : formatZodErrors(result.error)
    
    if (values.password !== values.confirmPassword) {
      fieldErrors.confirmPassword = "Les mots de passe doivent correspondre !"
    }
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return false
    }
    
    return true
  }

  return {
    handleSubmit,
    validate,
    validateField,
    setFieldValue,
    values,
    meta,
    validateProfileStep,
    validateAccountStep,
    isFieldValid,
  }
}
*/