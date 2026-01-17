import AsyncStorage from "@react-native-async-storage/async-storage";

const FORM_STORAGE_KEY = "libraryFormState";

export type NatalFormState = {
  day: string;
  month: string;
  year: string;
  time: string;
  city: string;
  latitude: string;
  longitude: string;
};

export type StoredNatalFormState = {
  me: NatalFormState;
  partner: NatalFormState;
};

const normalizeFormState = (input?: Partial<NatalFormState>): NatalFormState => ({
  day: input?.day ?? "",
  month: input?.month ?? "",
  year: input?.year ?? "",
  time: input?.time ?? "",
  city: input?.city ?? "",
  latitude: input?.latitude ?? "",
  longitude: input?.longitude ?? "",
});

export const getStoredNatalFormState = async (): Promise<StoredNatalFormState | null> => {
  try {
    const raw = await AsyncStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as
      | Partial<StoredNatalFormState>
      | Partial<NatalFormState>
      | null;

    if (!parsed || typeof parsed !== "object") return null;

    const hasNested = "me" in parsed || "partner" in parsed;
    const meState = normalizeFormState(
      hasNested ? (parsed as Partial<StoredNatalFormState>).me : (parsed as Partial<NatalFormState>),
    );
    const partnerState = normalizeFormState(
      hasNested ? (parsed as Partial<StoredNatalFormState>).partner : undefined,
    );

    return {
      me: meState,
      partner: partnerState,
    };
  } catch (error) {
    console.warn("Failed to read natal form state", error);
    return null;
  }
};
