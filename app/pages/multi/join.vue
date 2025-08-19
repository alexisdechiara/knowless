<template>
  <div
    class="relative flex h-svh w-full flex-col items-center justify-center scroll-smooth"
  >
    <form class="mb-32 scale-150" @submit="onSubmit">
      <FormField v-slot="{ componentField, value }" name="pin">
        <FormItem>
          <FormLabel class="inline-flex w-full justify-center text-lg">
            Code du salon
          </FormLabel>
          <FormControl>
            <PinInput
              id="pin-input"
              :model-value="value"
              placeholder="○"
              class="mt-1 flex items-center gap-2"
              otp
              type="text"
              :name="componentField.name"
              @update:model-value="(arrStr: string[]) => {
								setFieldValue('pin', arrStr.filter(Boolean))
							}"
              @complete="onSubmit()"
            >
              <PinInputGroup>
                <PinInputSlot v-for="(id, index) in 4" :key="id" :index="index" />
              </PinInputGroup>
            </PinInput>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </form>
    <Card
      v-if="lobbies && lobbies.length > 0"
      class="absolute bottom-32 w-full max-w-lg translate-y-full"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead id="lobbies" class="pointer-events-none text-base">
              Parties publiques
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="lobby in lobbies" :key="lobby.id">
            <TableRow v-if="lobby.isPublic" class="flex items-center">
              <TableCell class="w-fit font-medium"> {{ lobby.title }} </TableCell>
              <TableCell class="flex-1 text-right">
                {{ lobby.playerIds.length }} / {{ lobby.maxPlayers }}
              </TableCell>
              <TableCell class="w-fit text-center">
                <Button
                  :disabled="
                    lobby.playerIds.length >= lobby.maxPlayers ||
                    (user && lobby.bannedPlayersId.includes(user?.id))
                  "
                  @click="joinLobby(lobby)"
                >
                  {{
                    lobby.playerIds.length >= lobby.maxPlayers
                      ? "Complet"
                      : user && lobby.bannedPlayersId.includes(user?.id)
                      ? "Banni"
                      : "Rejoindre"
                  }}
                </Button>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </Card>
    <Button
      as-child
      variant="default"
      size="icon"
      class="invisible fixed bottom-4 left-4 size-12 sm:visible md:bottom-8 md:left-8"
    >
      <NuxtLink to="/multi">
        <Icon name="lucide:chevron-left" class="text-xl" />
      </NuxtLink>
    </Button>
    <Button
      size="icon"
      variant="outline"
      class="invisible fixed bottom-4 right-4 size-12 rounded-full sm:visible md:bottom-8 md:right-8"
      @click="showScrollTop ? scrollToTop() : scrollToAnchor('lobbies')"
    >
      <Icon
        name="lucide:arrow-down"
        class="text-lg transition-transform duration-300"
        :class="showScrollTop ? 'rotate-180' : ''"
      />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import * as z from "zod";
import { useWindowScroll, useWindowSize } from "@vueuse/core";
import Card from "~/components/ui/card/Card.vue";
import { joinLobby } from "~/composables/Lobby"; // Importer la fonction existante
import { Lobby } from "#shared/models/lobby";

definePageMeta({
  title: "Multijoueurs - Listes des salons",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const formSchema = toTypedSchema(
  z.object({
    pin: z.array(z.coerce.string()),
  })
);

const { handleSubmit, setFieldValue, values, setErrors } = useForm({
  validationSchema: formSchema,
});

onMounted(() => {
  const channel = supabase
    .channel(`lobby-updates`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "lobbies", filter: "is_public=eq.true" },
      (payload) => {
        const oldLobby = new Lobby(payload.old);
        const newLobby = new Lobby(payload.new);

        // Update the lobby in the list or add it if it doesn't exist
        const index = lobbies.value.findIndex((lobby) => lobby.id === newLobby.id);
        if (index !== -1) {
          lobbies.value[index] = newLobby;
        } else {
          lobbies.value.push(newLobby);
        }

        // Remove the lobby from the list if it was deleted
        if (payload.eventType === "DELETE") {
          lobbies.value = lobbies.value.filter((lobby) => lobby.id !== oldLobby.id);
        }
      }
    )
    .subscribe();

  onUnmounted(() => {
    supabase.removeChannel(channel);
  });
});

const onSubmit = handleSubmit(async () => {
  const { data, error } = await supabase
    .from("lobbies")
    .select("*")
    .eq("id", values?.pin?.join("") || "")
    .single();

  if (error) {
    setErrors({ pin: "Le lobby n'existe pas" });
  } else if (data) {
    const lobbyByCode = new Lobby(data);

    if (lobbyByCode.securityLevel.includes("code")) {
      joinLobby(lobbyByCode);
    } else {
      toast.error("Ce lobby interdit l'accès par code");
      setErrors({ pin: "" });
    }
  }
});

const lobbies = ref<Array<Lobby>>([]);
const { data, error } = await supabase.from("lobbies").select("*");

if (error) {
  toast.error(`Erreur ${error.code}`, {
    description: error.message,
  });
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lobbies.value = data.map((lobby: any) => new Lobby(lobby));
}

const { scrollToAnchor, scrollToTop } = useAnchorScroll({
  toTop: {
    scrollOptions: {
      behavior: "smooth",
      offsetTop: 0,
    },
  },
});

const { y } = useWindowScroll();
const { height } = useWindowSize();

const showScrollTop = computed(() => y.value > height.value * 0.1);
</script>
